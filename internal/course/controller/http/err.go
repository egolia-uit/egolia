package http

import (
	"errors"
	"net/http"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
	"github.com/gin-gonic/gin"
	ginmiddleware "github.com/oapi-codegen/gin-middleware"
)

func strictServerToHTTPErr(err *errs.Err) (
	message string,
	code string,
	statusCode int,
) {
	message = err.Message()
	code = err.Code().String()
	statusCode = 500
	switch err.Code() {
	case errs.CodeUnauthorized:
		statusCode = 401
	case errs.CodeForbidden:
		statusCode = 403
	case errs.CodeInvalid:
		statusCode = 400
	case errs.CodeUnimplemented:
		statusCode = 501
	case errs.CodeInternal,
		errs.CodeInternalGenerateID:
		statusCode = 500

	case errs.CodeLessonGenerateOrderFailed:
		statusCode = 500
	case errs.CodeLessonNotFound:
		statusCode = 404
	}
	return
}

func ginMiddlewareErrorHandler(c *gin.Context, message string, statusCode int) {
	var code string
	switch statusCode {
	case 401:
		code = errs.CodeUnauthorized.String()
	case 404:
		code = "pathOrMethodNotFound"
	case 400:
		code = errs.CodeInvalid.String()
	default:
		code = errs.CodeInternal.String()
	}

	response := course.Error{
		Code:     code,
		Message:  message,
		MoreInfo: nil,
	}
	c.JSON(statusCode, response)
}

var _ ginmiddleware.ErrorHandler = ginMiddlewareErrorHandler

// This is mostly for badRequest handling
func serverErrorHandler(c *gin.Context, err error, statusCode int) {
	if statusCode != http.StatusBadRequest {
		return
	}
	response := course.Error{
		Code:     errs.CodeInvalid.String(),
		Message:  err.Error(),
		MoreInfo: nil,
	}

	c.JSON(statusCode, response)
}

// Register after routing, handling business error
func StrictHandlerErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		err := c.Errors.Last().Err

		statusCode := c.Writer.Status()
		// The codegen already ensure setting this appropriately for err
		// Just for ensure
		if statusCode == http.StatusOK || statusCode == 0 {
			statusCode = http.StatusInternalServerError
		}

		// This handle for if we already return strict struct already, then don't
		if c.Writer.Written() {
			return
		}

		message := err.Error()
		code := ""
		if cerr, ok := errors.AsType[*errs.Err](err); ok {
			message, code, statusCode = strictServerToHTTPErr(cerr)
		}

		response := course.Error{
			Code:     code,
			Message:  message,
			MoreInfo: nil,
		}

		c.JSON(statusCode, response)
	}
}
