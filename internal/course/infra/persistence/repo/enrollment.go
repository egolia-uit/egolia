package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type enrollmentRepo struct {
	db *gorm.DB
}

func (r *enrollmentRepo) GetByID(ctx context.Context, params domain.EnrollmentRepoGetByID, forUpdate bool) (*domain.Enrollment, error) {
	db := txOrDB(ctx, r.db)
	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.Enrollment
	if err := db.First(&m, "id = ?", params.ID).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *enrollmentRepo) Save(ctx context.Context, enrollment *domain.Enrollment) error {
	m := model.EnrollmentFromDomain(enrollment)
	return txOrDB(ctx, r.db).Save(m).Error
}
