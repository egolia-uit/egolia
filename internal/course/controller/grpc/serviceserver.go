package grpc

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
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
	return nil, nil
}

func (ss *ServiceServer) GetCourseMetadata(ctx context.Context, params *pb.GetCourseMetadataRequest) (*pb.GetCourseMetadataResponse, error) {
	course, err := ss.app.Queries.GetCourseMetadata.Handle(ctx, app.GetCourseMetadata{
		CourseID: params.Id,
	})
	if err != nil {
		return nil, err
	}
	return &pb.GetCourseMetadataResponse{
		Course: courseToPb(course),
	}, nil
}
