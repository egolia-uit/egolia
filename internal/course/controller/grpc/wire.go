package grpc

import (
	"github.com/egolia-uit/egolia/pkg/pb"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	ProvideServiceServer,
	Provide,
	wire.Bind(new(pb.CourseServiceServer), new(*ServiceServer)),
)
