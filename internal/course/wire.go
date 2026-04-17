package course

import (
	"github.com/egolia-uit/egolia/internal/course/config"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	config.ProviderSet,
	ProvideServer,
)
