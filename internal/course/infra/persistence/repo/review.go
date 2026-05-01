package repo

import (
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
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
