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
	if cerr, ok := errors.AsType[*errs.Err](err); ok {
		switch cerr.Code() {
		case errs.CodeUnauthorized:
			return status.Error(codes.Unauthenticated, cerr.Error())
		case errs.CodeForbidden:
			return status.Error(codes.PermissionDenied, cerr.Error())
		case errs.CodeInvalid:
			return status.Error(codes.InvalidArgument, cerr.Error())
		case errs.CodeUnimplemented:
			return status.Error(codes.Unimplemented, cerr.Error())
		case errs.CodeInternal,
			errs.CodeInternalGenerateID:
			return status.Error(codes.Internal, cerr.Error())

		case errs.CodeLessonNotFound:
			return status.Error(codes.NotFound, cerr.Error())
		case errs.CodeLessonGenerateOrderFailed:
			return status.Error(codes.FailedPrecondition, cerr.Error())

		case errs.CodeObjectStorageFailToRetrieveUploadURLForVideoLesson, errs.CodeObjectStorageFailToRetrieveDownloadURLForVideoLesson:
			return status.Error(codes.Internal, cerr.Error())
		case errs.CodeCourseNotFound:
			return status.Error(codes.NotFound, cerr.Error())
		case errs.CodeCourseInvalid,
			errs.CodeCourseAlreadyExists,
			errs.CodeCourseCannotModify,
			errs.CodeCourseHasEnrollment,
			errs.CodeCourseStatusInvalid,
			errs.CodeSectionInvalid:
			return status.Error(codes.InvalidArgument, cerr.Error())
		case errs.CodeSectionNotFound:
			return status.Error(codes.NotFound, cerr.Error())
		case errs.CodeInstructorPermissionDenied:
			return status.Error(codes.PermissionDenied, cerr.Error())
		case errs.CodeCourseNotApproved:
			return status.Error(codes.PermissionDenied, cerr.Error())

		default:
			return status.Error(codes.Unknown, cerr.Error())
		}
	} else if errors.Is(err, context.Canceled) {
		return status.Error(codes.Canceled, "request canceled")
	} else if errors.Is(err, context.DeadlineExceeded) {
		return status.Error(codes.DeadlineExceeded, "deadline exceeded")
	} else if cerr, ok := errors.AsType[errs.Error](err); ok {
		switch cerr.Code() {
		case errs.CodeUnauthorized:
			return status.Error(codes.Unauthenticated, cerr.Error())
		case errs.CodeForbidden:
			return status.Error(codes.PermissionDenied, cerr.Error())
		case errs.CodeInvalid:
			return status.Error(codes.InvalidArgument, cerr.Error())
		case errs.CodeUnimplemented:
			return status.Error(codes.Unimplemented, cerr.Error())
		case errs.CodeInternal,
			errs.CodeInternalGenerateID:
			return status.Error(codes.Internal, cerr.Error())

		case errs.CodeLessonNotFound:
			return status.Error(codes.NotFound, cerr.Error())
		case errs.CodeLessonGenerateOrderFailed:
			return status.Error(codes.FailedPrecondition, cerr.Error())

		case errs.CodeObjectStorageFailToRetrieveUploadURLForVideoLesson:
			return status.Error(codes.Internal, cerr.Error())
		case errs.CodeCourseNotFound:
			return status.Error(codes.NotFound, cerr.Error())
		case errs.CodeCourseInvalid,
			errs.CodeCourseAlreadyExists,
			errs.CodeCourseCannotModify,
			errs.CodeCourseHasEnrollment,
			errs.CodeCourseStatusInvalid,
			errs.CodeSectionInvalid:
			return status.Error(codes.InvalidArgument, cerr.Error())
		case errs.CodeSectionNotFound:
			return status.Error(codes.NotFound, cerr.Error())
		case errs.CodeInstructorPermissionDenied:
			return status.Error(codes.PermissionDenied, cerr.Error())
		case errs.CodeCourseNotApproved:
			return status.Error(codes.PermissionDenied, cerr.Error())

		default:
			return status.Error(codes.Unknown, cerr.Error())
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
