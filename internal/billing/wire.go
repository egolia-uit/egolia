package billing

import (
	"github.com/egolia-uit/egolia/internal/billing/component"
	"github.com/egolia-uit/egolia/internal/billing/config"
	"github.com/egolia-uit/egolia/internal/billing/controller"
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/internal/billing/infra"
	"github.com/egolia-uit/egolia/pkg/logging"
	"github.com/egolia-uit/egolia/pkg/otel"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewServer,
	component.ProviderSet,
	config.ProviderSet,
	controller.ProviderSet,
	core.ProviderSet,
	infra.ProviderSet,
	logging.ProviderSet,
	otel.ProviderSet,
)
