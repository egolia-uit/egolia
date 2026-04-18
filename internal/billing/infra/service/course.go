package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/billing/config"
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/internal/billing/errs"
	"github.com/egolia-uit/egolia/pkg/pb"
	"github.com/google/uuid"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/logging"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
)

type Course struct {
	client pb.CourseServiceClient
}

func NewCourse(
	servicesCfg *config.Services,
	logger logging.Logger,
) (*Course, func(), error) {
	statsHandler := otelgrpc.NewClientHandler()
	conn, err := grpc.NewClient(
		servicesCfg.Course.URL,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithStatsHandler(statsHandler),
		grpc.WithChainUnaryInterceptor(
			logging.UnaryClientInterceptor(logger, logging.WithLogOnEvents(logging.StartCall, logging.FinishCall)),
		),
		grpc.WithChainUnaryInterceptor(courseUnaryClientErrorInterceptor()),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to dial course service: %w", err)
	}
	client := pb.NewCourseServiceClient(conn)

	cleanup := func() {
		if err := conn.Close(); err != nil {
			slog.Error("failed to close course service connection", "error", err)
		}
	}
	return &Course{
		client: client,
	}, cleanup, nil
}

var _ core.CourseSvc = (*Course)(nil)

func (c *Course) GetCourse(ctx context.Context, id uuid.UUID) (*core.Course, error) {
	coursePb, err := c.client.GetCourse(ctx, &pb.GetCourseRequest{
		Id: id.String(),
	})
	if err != nil {
		if st, ok := status.FromError(err); ok && st.Code() == codes.NotFound {
			return nil, errs.NewCourseNotFoundErr(id)
		}
		return nil, err
	}
	return toCouse(coursePb.Course), nil
}

func toCouse(pbCourse *pb.Course) *core.Course {
	return &core.Course{
		ID:           uuid.MustParse(pbCourse.Id),
		Title:        pbCourse.Title,
		InstructorID: pbCourse.InstructorId,
		Price:        pbCourse.Price,
	}
}

func courseUnaryClientErrorInterceptor() grpc.UnaryClientInterceptor {
	return func(
		ctx context.Context,
		method string,
		req, reply any,
		cc *grpc.ClientConn,
		invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption,
	) error {
		err := invoker(ctx, method, req, reply, cc, opts...)
		if err != nil {
			if method == "/grpc.health.v1.Health/Check" {
				return err
			}
			return mapGrpcError(err)
		}
		return nil
	}
}

func mapGrpcError(err error) error {
	st, ok := status.FromError(err)
	if !ok {
		// If not a gRPC status error, wrap as internal
		return errs.NewCourseSvcInternalErr(err)
	}

	//exhaustive:ignore
	switch st.Code() {
	case codes.Internal, codes.Unknown:
		return errs.NewCourseSvcInternalErr(err)
	case codes.InvalidArgument:
		return errs.NewInvalid(st.Message())
	case codes.Unauthenticated:
		return errs.Unauthorized
	case codes.PermissionDenied:
		return errs.NewForbidden(st.Message())
	default:
		return errs.NewCourseSvcInternalErr(err)
	}
}
