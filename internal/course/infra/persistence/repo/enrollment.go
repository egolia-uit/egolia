package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type EnrollmentRepo struct {
	db *gorm.DB
}

func NewEnrollmentRepo(db *gorm.DB) *EnrollmentRepo {
	return &EnrollmentRepo{db: db}
}

var _ domain.EnrollmentRepo = (*EnrollmentRepo)(nil)

func (r *EnrollmentRepo) ExistsByCourseID(ctx context.Context, courseID uuid.UUID) (bool, error) {
	panic("unimplemented")
}

<<<<<<< HEAD
<<<<<<< HEAD
func (r *EnrollmentRepo) GetByID(ctx context.Context, params domain.EnrollmentRepoGetByID, forUpdate bool) (*domain.Enrollment, error) {
=======
func (r *enrollmentRepo) GetByID(ctx context.Context, params domain.EnrollmentRepoGetByID, forUpdate bool) (*domain.Enrollment, error) {
>>>>>>> 65e45e788 (feat: read model in)
=======
func (r *EnrollmentRepo) GetByID(ctx context.Context, params domain.EnrollmentRepoGetByID, forUpdate bool) (*domain.Enrollment, error) {
>>>>>>> 97d60f7c3 (feat: check backend)
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

func (r *EnrollmentRepo) Save(ctx context.Context, enrollment *domain.Enrollment) error {
	m := model.EnrollmentFromDomain(enrollment)
	return r.db.WithContext(ctx).Save(m).Error
}
