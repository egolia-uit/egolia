package course

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/component"
	"github.com/egolia-uit/egolia/internal/course/config"
	"github.com/egolia-uit/egolia/internal/course/controller"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra"
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
