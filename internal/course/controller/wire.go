package controller

import (
	"github.com/egolia-uit/egolia/internal/course/controller/grpc"
	"github.com/egolia-uit/egolia/internal/course/controller/health"
	"github.com/egolia-uit/egolia/internal/course/controller/http"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	grpc.ProviderSet,
	http.ProviderSet,
	health.ProviderSet,
)
