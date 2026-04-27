package controller

import (
	"github.com/egolia-uit/egolia/internal/billing/controller/health"
	"github.com/egolia-uit/egolia/internal/billing/controller/http"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	http.ProviderSet,
	health.ProviderSet,
)
