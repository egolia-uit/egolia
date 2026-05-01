package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type enrollmentRepo struct {
	db *gorm.DB
}

// ExistsByCourseID implements [domain.EnrollmentRepo].
func (r *enrollmentRepo) ExistsByCourseID(ctx context.Context, courseID uuid.UUID) (bool, error) {
	panic("unimplemented")
}

func (r *enrollmentRepo) GetByID(ctx context.Context, params domain.EnrollmentRepoGetByID, forUpdate bool) (*domain.Enrollment, error) {
	db := r.db.WithContext(ctx)
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
	return r.db.WithContext(ctx).Save(m).Error
}
