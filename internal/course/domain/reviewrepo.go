package domain

import (
	"context"

	"github.com/google/uuid"
)

type ReviewRepo interface {
	Save(ctx context.Context, review *Review) error
	Delete(ctx context.Context, id uuid.UUID) error
	ExistsByCourseAndLearner(ctx context.Context, courseID uuid.UUID, learnerID string) (bool, error)
}
