//go:build wireinject

package main

import (
	"context"

	"github.com/goforj/wire"
	"github.com/egolia-uit/egolia/internal/course"
)

var ProviderSet = wire.NewSet(
	course.ProviderSet,
	wire.Value(ServiceName),
	wire.Value(ServiceVersion),
)

func InitializeServer(ctx context.Context) (*course.Server, func(), error) {
	panic(wire.Build(ProviderSet))
}
