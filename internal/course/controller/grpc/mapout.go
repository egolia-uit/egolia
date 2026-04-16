package grpc

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/pkg/pb"
)

func courseToPb(course *app.Course) *pb.Course {
	return &pb.Course{
		Id:           course.ID.String(),
		Title:        course.Title,
		InstructorId: course.InstructorID,
		Status:       pb.CourseStatus_COURSE_STATUS_ARCHIVED,
		Price:        course.Price,
	}
}
