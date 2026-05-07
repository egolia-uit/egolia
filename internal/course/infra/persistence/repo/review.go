package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewRepo struct {
	db *gorm.DB
}

// Delete implements [domain.ReviewRepo].
func (r *ReviewRepo) Delete(ctx context.Context, id uuid.UUID) error {
	panic("unimplemented")
}

// Save implements [domain.ReviewRepo].
func (r *ReviewRepo) Save(ctx context.Context, review *domain.Review) error {
	panic("unimplemented")
}

func NewReviewRepo(db *gorm.DB) *ReviewRepo {
	return &ReviewRepo{db: db}
}

var _ domain.ReviewRepo = (*ReviewRepo)(nil)

func (r *ReviewRepo) ExistsByCourseAndLearner(ctx context.Context, courseID uuid.UUID, learnerID string) (bool, error) {
	// TODO: implement this
	panic("unimplemented")
}
