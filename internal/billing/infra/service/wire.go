package service

import (
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewCourse,
	wire.Bind(new(core.CourseSvc), new(*Course)),
)
