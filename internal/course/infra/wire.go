package infra

import (
	"github.com/egolia-uit/egolia/internal/course/infra/persistence"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	persistence.ProviderSet,
)
