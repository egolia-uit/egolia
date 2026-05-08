package infra

import (
	"github.com/egolia-uit/egolia/internal/billing/infra/identity"
	"github.com/egolia-uit/egolia/internal/billing/infra/service"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	identity.ProviderSet,
	service.ProviderSet,
)
