package http

import (
	"errors"
	"net/http"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
	"github.com/gin-gonic/gin"
	ginmiddleware "github.com/oapi-codegen/gin-middleware"
)

func strictServerToHTTPErr(err errs.Error) (
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

	case errs.CodeObjectStorageFailToRetrieveUploadURLForVideoLesson, errs.CodeObjectStorageFailToRetrieveDownloadURLForVideoLesson:
		statusCode = 500

	case errs.CodeCourseNotFound:
		statusCode = 404
	case errs.CodeCourseInvalid:
		statusCode = 400
	case errs.CodeCourseAlreadyExists:
		statusCode = 400
	case errs.CodeCourseCannotModify:
		statusCode = 400
	case errs.CodeCourseHasEnrollment:
		statusCode = 400
	case errs.CodeCourseStatusInvalid:
		statusCode = 400
	case errs.CodeSectionNotFound:
		statusCode = 404
	case errs.CodeSectionInvalid:
		statusCode = 400
	case errs.CodeInstructorPermissionDenied:
		statusCode = 403
	case errs.CodeCourseNotApproved:
		statusCode = 403
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

func strictHandlerRequestErrorHandler(c *gin.Context, err error) {
	response := course.Error{
		Code:     errs.CodeInvalid.String(),
		Message:  err.Error(),
		MoreInfo: nil,
	}
	c.JSON(http.StatusBadRequest, response)
}

func strictHandlerError(c *gin.Context, err error) {
	var message string
	var code string
	var statusCode int
	if cerr, ok := errors.AsType[errs.Error](err); ok {
		message, code, statusCode = strictServerToHTTPErr(cerr)
	} else {
		message = "internal server error occured, please check log from server"
		code = errs.CodeInternal.String()
		statusCode = 500
	}
	response := course.Error{
		Code:     code,
		Message:  message,
		MoreInfo: nil,
	}

	c.JSON(statusCode, response)
}

func strictHandlerResponseErrorHandler(c *gin.Context, err error) {
	response := course.Error{
		Code:     errs.CodeInternal.String(),
		Message:  err.Error(),
		MoreInfo: nil,
	}
	c.JSON(http.StatusInternalServerError, response)
}
