package domain

import (
	"context"

	"github.com/google/uuid"
)

type ReviewRepo interface {
	Save(review *Review) error
	ExistsByCourseAndLearner(ctx context.Context, courseID uuid.UUID, learnerID string) (bool, error)
}
