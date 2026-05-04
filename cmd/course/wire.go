//go:build wireinject

package main

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	course.ProviderSet,
	wire.Value(ServiceName),
	wire.Value(ServiceVersion),
)

func InitializeServer(ctx context.Context) (*course.Server, func(), error) {
	panic(wire.Build(ProviderSet))
}
