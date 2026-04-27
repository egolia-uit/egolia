package persistence

import (
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/repo"
	"github.com/goforj/wire"
)

var RepoProviderSet = wire.NewSet(
	repo.NewUnitOfWork,
)

var ProviderSet = wire.NewSet(
	RepoProviderSet,
)
