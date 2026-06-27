package blog

import (
	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/component"
	"github.com/egolia-uit/egolia/internal/blog/config"
	"github.com/egolia-uit/egolia/internal/blog/controller"
	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/infra"
	"github.com/egolia-uit/egolia/pkg/logging"
	"github.com/egolia-uit/egolia/pkg/otel"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewServer,
	app.ProviderSet,
	component.ProviderSet,
	config.ProviderSet,
	controller.ProviderSet,
	domain.ProviderSet,
	infra.ProviderSet,
	logging.ProviderSet,
	otel.ProviderSet,
)
