//go:build wireinject

package main

import (
	"context"

	"github.com/goforj/wire"
	"github.com/egolia-uit/egolia/internal/blog"
)

var ProviderSet = wire.NewSet(
	blog.ProviderSet,
	wire.Value(ServiceName),
	wire.Value(ServiceVersion),
)

func InitializeServer(ctx context.Context) (*blog.Server, func(), error) {
	panic(wire.Build(ProviderSet))
}
