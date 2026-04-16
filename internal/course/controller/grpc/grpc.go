package grpc

import (
	"context"
	"fmt"
	"net"

	"google.golang.org/grpc"

	"buf.build/go/protovalidate"
	"github.com/egolia-uit/egolia/internal/course/config"
	"github.com/egolia-uit/egolia/pkg/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/logging"
	protovalidate_middleware "github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/protovalidate"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

type GRPC struct {
	server  *grpc.Server
	address string
}

func New(
	ctx context.Context,
	serviceServer *ServiceServer,
	cfg *config.Server,
	logger logging.Logger,
) (*GRPC, func(), error) {
	validator, err := protovalidate.New()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create protovalidate validator: %w", err)
	}
	grpcServer := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
		grpc.ChainUnaryInterceptor(
			logging.UnaryServerInterceptor(logger, logging.WithLogOnEvents(logging.StartCall, logging.FinishCall)),
			protovalidate_middleware.UnaryServerInterceptor(validator),
			unaryErrorInterceptor,
		),
	)
	grpc := &GRPC{
		server:  grpcServer,
		address: cfg.GRPC.Address(),
	}
	pb.RegisterCourseServiceServer(grpcServer, serviceServer)
	return grpc, grpcServer.GracefulStop, nil
}

func (g *GRPC) Run() error {
	lis, err := net.Listen("tcp", g.address)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", g.address, err)
	}
	return g.server.Serve(lis)
}

func (g *GRPC) Stop() {
	g.server.GracefulStop()
}

var Provide = New
