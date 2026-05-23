package core

import (
	"context"

	"github.com/google/uuid"
)

type TransactionRepo interface {
	GetByID(ctx context.Context, id uuid.UUID) (*Transaction, error)
	Save(ctx context.Context, transaction *Transaction) error
}
