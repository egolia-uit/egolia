package seedcourse

import (
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewConfig,
	NewDB,
	NewSeed,
	NewValidate,
	NewViper,
)
