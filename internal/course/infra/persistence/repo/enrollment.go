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
	var count int64
	if err := r.db.WithContext(ctx).Model(new(model.Enrollment)).
		Where("course_id = ?", courseID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *EnrollmentRepo) ExistsByCourseAndLearner(ctx context.Context, courseID uuid.UUID, learnerID string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(new(model.Enrollment)).
		Where("course_id = ? AND learner_id = ?", courseID, learnerID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *EnrollmentRepo) GetByID(ctx context.Context, params domain.EnrollmentRepoGetByID, forUpdate bool) (*domain.Enrollment, error) {
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

func (r *EnrollmentRepo) GetByCourseAndLearner(ctx context.Context, params domain.EnrollmentRepoGetByCourseAndLearner, forUpdate bool) (*domain.Enrollment, error) {
	db := r.db.WithContext(ctx)
	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.Enrollment
	if err := db.First(&m, "course_id = ? AND learner_id = ?", params.CourseID, params.LearnerID).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *EnrollmentRepo) GetByCourseID(ctx context.Context, courseID uuid.UUID) ([]*domain.Enrollment, error) {
	var ms []model.Enrollment
	if err := r.db.WithContext(ctx).
		Where("course_id = ?", courseID).
		Find(&ms).Error; err != nil {
		return nil, err
	}
	result := make([]*domain.Enrollment, 0, len(ms))
	for i := range ms {
		result = append(result, ms[i].ToDomain())
	}
	return result, nil
}

func (r *EnrollmentRepo) Save(ctx context.Context, enrollment *domain.Enrollment) error {
	m := model.EnrollmentFromDomain(enrollment)
	return r.db.WithContext(ctx).Save(m).Error
}
