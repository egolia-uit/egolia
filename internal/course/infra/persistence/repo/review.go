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

func NewReviewRepo(db *gorm.DB) *ReviewRepo {
	return &ReviewRepo{db: db}
}

var _ domain.ReviewRepo = (*ReviewRepo)(nil)

// ReviewRepo.Save does not take context (per domain interface)
func (r *ReviewRepo) Save(review *domain.Review) error {
	m := model.ReviewFromDomain(review)
	return r.db.Save(m).Error
}

func (r *ReviewRepo) ExistsByCourseAndLearner(ctx context.Context, courseID uuid.UUID, learnerID string) (bool, error) {
	// unemplemented
	return false, nil
	// var count int64
	// if err := r.db.WithContext(ctx).Model(&model.Review{}).
	// 	Where("course_id = ? AND user_id = ?", courseID, learnerID).
	// 	Count(&count).Error; err != nil {
	// 	return false, err
	// }
	// return count > 0, nil
}
