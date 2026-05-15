package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewRepo struct {
	db *gorm.DB
}

// Delete implements [domain.ReviewRepo].
func (r *ReviewRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(new(model.Review)).Error
}

// Save implements [domain.ReviewRepo].
func (r *ReviewRepo) Save(ctx context.Context, review *domain.Review) error {
	m := model.ReviewFromDomain(review)
	return r.db.WithContext(ctx).Save(m).Error
}

func NewReviewRepo(db *gorm.DB) *ReviewRepo {
	return &ReviewRepo{db: db}
}

var _ domain.ReviewRepo = (*ReviewRepo)(nil)

func (r *ReviewRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Review, error) {
	var m model.Review
	if err := r.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *ReviewRepo) ExistsByCourseAndLearner(ctx context.Context, courseID uuid.UUID, learnerID string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(new(model.Review)).
		Where("course_id = ? AND user_id = ?", courseID, learnerID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
