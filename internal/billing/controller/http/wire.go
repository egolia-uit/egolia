package http

import (
	commonhttp "github.com/egolia-uit/egolia/pkg/common/http"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	New,
	ProvideHandler,
	ProvideStrictHandler,
	commonhttp.ProviderSet,
	wire.Bind(new(IStrictHandler), new(*StrictHandler)),
)
