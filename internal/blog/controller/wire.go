package controller

import (
	"github.com/egolia-uit/egolia/internal/blog/controller/health"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	health.ProviderSet,
)
