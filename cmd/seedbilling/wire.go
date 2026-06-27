//go:build wireinject

package main

import (
	"context"

	"github.com/egolia-uit/egolia/internal/seedbilling"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	seedbilling.ProviderSet,
)

func InitializeSeed(ctx context.Context) (*seedbilling.Seed, func(), error) {
	panic(wire.Build(ProviderSet))
}
