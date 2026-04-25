package commonhttp

import (
	"log/slog"

	commonconfig "github.com/egolia-uit/egolia/pkg/common/config"
	"github.com/egolia-uit/egolia/pkg/metadata"
	"github.com/gin-gonic/gin"
	sloggin "github.com/samber/slog-gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

type GinSlogHandlerFunc gin.HandlerFunc

func NewGinSlogHandler(
	logCfg *commonconfig.Log,
	logger *slog.Logger,
) GinSlogHandlerFunc {
	cfg := sloggin.Config{
		WithUserAgent:      true,
		WithRequestID:      true,
		WithRequestBody:    true,
		WithRequestHeader:  true,
		WithResponseBody:   true,
		WithResponseHeader: true,
		WithSpanID:         true,
		WithTraceID:        true,
	}
	return GinSlogHandlerFunc(sloggin.NewWithConfig(logger, cfg))
}

var ProvideGinSlogHandler = NewGinSlogHandler

type OtelGinHandlerFunc gin.HandlerFunc

func NewOtelGinHandler(
	serviceName metadata.ServiceName,
) OtelGinHandlerFunc {
	return OtelGinHandlerFunc(otelgin.Middleware(
		serviceName.String(),
	))
}

var ProvideOtelGinHandler = NewOtelGinHandler

func NewGin(
	slogHandler GinSlogHandlerFunc,
	otelHandler OtelGinHandlerFunc,
) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(gin.HandlerFunc(otelHandler))
	r.Use(gin.HandlerFunc(slogHandler))
	return r
}

var ProvideGin = NewGin
