package payment

import (
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewVnpay,
	wire.Bind(new(core.PaymentGateway), new(*Vnpay)),
)
