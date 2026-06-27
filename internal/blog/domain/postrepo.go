package domain

import (
	"context"

	"github.com/google/uuid"
)

type PostRepo interface {
	Get(ctx context.Context, id uuid.UUID) (*Post, error)
	Save(ctx context.Context, post *Post) error
	Delete(ctx context.Context, id uuid.UUID) error
}
