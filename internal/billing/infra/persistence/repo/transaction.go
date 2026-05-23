package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/internal/billing/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionRepo struct {
	db *gorm.DB
}

func NewTransactionRepo(db *gorm.DB) *TransactionRepo {
	return &TransactionRepo{db: db}
}

var _ core.TransactionRepo = (*TransactionRepo)(nil)

func (r *TransactionRepo) GetByID(ctx context.Context, id uuid.UUID) (*core.Transaction, error) {
	var m model.Transaction
	if err := r.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *TransactionRepo) Save(ctx context.Context, transaction *core.Transaction) error {
	m := model.TransactionFromDomain(transaction)
	return r.db.WithContext(ctx).Save(m).Error
}
