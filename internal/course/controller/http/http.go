package http

import (
	"context"
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/egolia-uit/egolia/api"
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/config"
	"github.com/egolia-uit/egolia/pkg/api/course"
	commonhttp "github.com/egolia-uit/egolia/pkg/common/http"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/gin-gonic/gin"
	"github.com/oapi-codegen/gin-middleware"
)

type (
	IHandler       = course.ServerInterface
	IStrictHandler = course.StrictServerInterface
)

type StrictHandler struct {
	App     *app.App
	BaseURL *url.URL
}

var _ IStrictHandler = (*StrictHandler)(nil)

func NewStrictHandler(
	app *app.App,
	cfg *config.Server,
) *StrictHandler {
	return &StrictHandler{
		App: app,
		BaseURL: &url.URL{
			Scheme: "http",
			Host:   cfg.HTTP.Address(),
		},
	}
}

var ProvideStrictHandler = NewStrictHandler

func NewHandler(
	strictServer IStrictHandler,
) IHandler {
	return course.NewStrictHandler(strictServer, nil)
}

var ProvideHandler = NewHandler

func ValidateHandler() (gin.HandlerFunc, error) {
	spec, err := api.GetSpec(nil, api.CourseSpec)
	if err != nil {
		return nil, err
	}
	spec.Servers = nil
	spec.Security = nil
	opts := &ginmiddleware.Options{
		ErrorHandler: ginMiddlewareErrorHandler,
		Options: openapi3filter.Options{
			MultiError: true,
		},
	}
	return ginmiddleware.OapiRequestValidatorWithOptions(spec, opts), nil
}

func RegisterRoutes(
	e *gin.Engine,
	handler IHandler,
) error {
	validateHandler, err := ValidateHandler()
	if err != nil {
		return err
	}
	api := e.Group("/")
	{
		api.Use(commonhttp.GatewayUserAuth())
		api.Use(validateHandler)
		//exhaustruct:ignore
		options := course.GinServerOptions{
			ErrorHandler: serverErrorHandler,
		}
		course.RegisterHandlersWithOptions(api, handler, options)
		api.Use(StrictHandlerErrorMiddleware())
	}
	e.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})
	return nil
}

type HTTP struct {
	*http.Server
}

func New(
	ctx context.Context,
	ginEngine *gin.Engine,
	handler IHandler,
	cfg *config.Server,
	logger *slog.Logger,
) (*HTTP, func(), error) {
	if err := RegisterRoutes(ginEngine, handler); err != nil {
		return nil, nil, err
	}

	server := &HTTP{
		Server: &http.Server{
			Addr:    cfg.HTTP.Address(),
			Handler: ginEngine,
		},
	}
	cleanup := func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			logger.ErrorContext(ctx, "failed to shutdown http server", slog.Any("error", err))
		}
	}
	return server, cleanup, nil
}

func (h *HTTP) Run() error {
	return h.ListenAndServe()
}

var Provide = New
