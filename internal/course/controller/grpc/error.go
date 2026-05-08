package grpc

import (
	"context"
	"errors"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/egolia-uit/egolia/internal/course/errs"
)

func toGRPCError(err error) error {
	if err, ok := errors.AsType[errs.Error](err); ok {
		switch err.Code() {
		case errs.CodeUnauthorized:
			return status.Error(codes.Unauthenticated, err.Error())
		case errs.CodeForbidden:
			return status.Error(codes.PermissionDenied, err.Error())
		case errs.CodeInvalid:
			return status.Error(codes.InvalidArgument, err.Error())
		case errs.CodeUnimplemented:
			return status.Error(codes.Unimplemented, err.Error())
		case errs.CodeInternal,
			errs.CodeInternalGenerateID:
			return status.Error(codes.Internal, err.Error())

		case errs.CodeLessonNotFound:
			return status.Error(codes.NotFound, err.Error())
		case errs.CodeLessonGenerateOrderFailed:
			return status.Error(codes.FailedPrecondition, err.Error())

		case errs.CodeObjectStorageFailToRetrieveUploadURLForVideoLesson, errs.CodeObjectStorageFailToRetrieveDownloadURLForVideoLesson:
			return status.Error(codes.Internal, err.Error())
		case errs.CodeCourseNotFound:
			return status.Error(codes.NotFound, err.Error())
		case errs.CodeCourseInvalid,
			errs.CodeCourseAlreadyExists,
			errs.CodeCourseCannotModify,
			errs.CodeCourseHasEnrollment,
			errs.CodeCourseStatusInvalid,
			errs.CodeSectionInvalid:
			return status.Error(codes.InvalidArgument, err.Error())
		case errs.CodeSectionNotFound:
			return status.Error(codes.NotFound, err.Error())
		case errs.CodeInstructorPermissionDenied:
			return status.Error(codes.PermissionDenied, err.Error())
		case errs.CodeCourseNotApproved:
			return status.Error(codes.PermissionDenied, err.Error())

		default:
			return status.Error(codes.Unknown, err.Error())
		}
	}
	return err
}

func unaryErrorInterceptor(
	ctx context.Context,
	req any,
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (any, error) {
	resp, err := handler(ctx, req)
	if err != nil {
		return nil, toGRPCError(err)
	}
	return resp, nil
}
