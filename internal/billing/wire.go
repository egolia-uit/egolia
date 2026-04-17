package billing

import (
	"github.com/egolia-uit/egolia/internal/billing/config"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	ProvideServer,
	config.ProviderSet,
)
