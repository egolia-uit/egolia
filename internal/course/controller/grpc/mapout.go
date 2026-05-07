package grpc

import (
	"fmt"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/pb"
)

func courseToPb(course *app.Course) (*pb.Course, error) {
	status, err := courseStatusToPb(course.Status)
	if err != nil {
		return nil, err
	}
	return &pb.Course{
		Id:           course.ID.String(),
		Title:        course.Title,
		InstructorId: course.InstructorID,
		Status:       status,
		Price:        course.Price,
	}, nil
}

func courseStatusToPb(status app.CourseStatus) (pb.CourseStatus, error) {
	switch status {
	case app.CourseStatusDraft:
		return pb.CourseStatus_COURSE_STATUS_DRAFT, nil
	case app.CourseStatusPending:
		return pb.CourseStatus_COURSE_STATUS_PENDING, nil
	case app.CourseStatusApproved:
		return pb.CourseStatus_COURSE_STATUS_APPROVED, nil
	case app.CourseStatusRejected:
		return pb.CourseStatus_COURSE_STATUS_REJECTED, nil
	default:
		return pb.CourseStatus_COURSE_STATUS_UNSPECIFIED, errs.NewInvalid(fmt.Sprintf("invalid course status: %v", status))
	}
}
