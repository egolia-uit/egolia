package persistence

import (
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/repo"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewDB,
	repo.NewRegistry,
	repo.NewUnitOfWork,
	wire.Bind(new(domain.RepoRegistry), new(*repo.Registry)),
	wire.Bind(new(domain.UnitOfWork), new(*repo.UnitOfWork)),
)
