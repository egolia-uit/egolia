package identity

import (
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	ProvideAuthentik,
	wire.Bind(new(core.IdentitySvc), new(*Authentik)),
)
