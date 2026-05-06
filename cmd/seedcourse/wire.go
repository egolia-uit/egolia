//go:build wireinject

package main

import (
	"context"

	"github.com/egolia-uit/egolia/internal/seedcourse"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	seedcourse.ProviderSet,
)

func InitializeSeed(ctx context.Context) (*seedcourse.Seed, func(), error) {
	panic(wire.Build(ProviderSet))
}
