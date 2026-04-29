package repo

import (
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
)

type reviewRepo struct {
	db *gorm.DB
}

// ReviewRepo.Save does not take context (per domain interface)
func (r *reviewRepo) Save(review *domain.Review) error {
	m := model.ReviewFromDomain(review)
	return r.db.Save(m).Error
}
