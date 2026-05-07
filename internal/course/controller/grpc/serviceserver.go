package grpc

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/pb"
)

type ServiceServer struct {
	app *app.App
}

var _ pb.CourseServiceServer = (*ServiceServer)(nil)

func NewServiceServer(app *app.App) *ServiceServer {
	return &ServiceServer{
		app: app,
	}
}

var ProvideServiceServer = NewServiceServer

func (ss *ServiceServer) GetCourseTitlesByIds(ctx context.Context, params *pb.GetCourseTitlesByIdsRequest) (*pb.GetCourseTitlesByIdsResponse, error) {
	return nil, errs.Unimplemented
}

func (ss *ServiceServer) GetCourse(ctx context.Context, params *pb.GetCourseRequest) (*pb.GetCourseResponse, error) {
	query := &app.GetCourse{
		CourseID: params.Id,
	}
	course, err := ss.app.Queries.GetCourse.Handle(ctx, query)
	if err != nil {
		return nil, err
	}
	res, err := courseToPb(course)
	if err != nil {
		return nil, err
	}
	return &pb.GetCourseResponse{
		Course: res,
	}, nil
}

func (ss *ServiceServer) EnrollCourseForUser(ctx context.Context, params *pb.EnrollCourseForUserRequest) (*pb.EnrollCourseForUserResponse, error) {
	return nil, errs.Unimplemented
	// cmd := &app.EnrollCourseForUser{
	// 	CourseID: params.CourseId,
	// 	UserID:   params.UserId,
	// }
	// enrollmentID, err := ss.app.Commands.EnrollCourseForUser.Handle(ctx, cmd)
	// if err != nil {
	// 	return nil, err
	// }
	// return &pb.EnrollCourseForUserResponse{
	// 	EnrollmentId: enrollmentID,
	// }, nil
}
