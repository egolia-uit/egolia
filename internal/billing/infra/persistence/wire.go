package persistence

import (
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/internal/billing/infra/persistence/repo"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewDB,
	NewPG,
	repo.NewTransactionRepo,
	wire.Bind(new(core.TransactionRepo), new(*repo.TransactionRepo)),
)
