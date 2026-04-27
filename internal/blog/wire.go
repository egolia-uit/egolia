package blog

import (
	"github.com/egolia-uit/egolia/internal/blog/component"
	"github.com/egolia-uit/egolia/internal/blog/config"
	"github.com/egolia-uit/egolia/pkg/logging"
	"github.com/egolia-uit/egolia/pkg/otel"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewServer,
	component.ProviderSet,
	config.ProviderSet,
	logging.ProviderSet,
	otel.ProviderSet,
)
