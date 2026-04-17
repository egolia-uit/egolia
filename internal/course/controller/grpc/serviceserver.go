package grpc

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/pb"
)

type ServiceServer struct {
	pb.UnimplementedCourseServiceServer
	app *app.App
}

var _ pb.CourseServiceServer = (*ServiceServer)(nil)

func NewServiceServer(app *app.App) *ServiceServer {
	return &ServiceServer{
		UnimplementedCourseServiceServer: pb.UnimplementedCourseServiceServer{},
		app:                              app,
	}
}

var ProvideServiceServer = NewServiceServer

func (ss *ServiceServer) GetCourseTitlesByIds(ctx context.Context, params *pb.GetCourseTitlesByIdsRequest) (*pb.GetCourseTitlesByIdsResponse, error) {
	return nil, errs.Unimplemented
}

func (ss *ServiceServer) GetCourse(ctx context.Context, params *pb.GetCourseRequest) (*pb.GetCourseResponse, error) {
	course, err := ss.app.Queries.GetCourse.Handle(ctx, app.GetCourse{
		CourseID: params.Id,
	})
	if err != nil {
		return nil, err
	}
	return &pb.GetCourseResponse{
		Course: courseToPb(course),
	}, nil
}
