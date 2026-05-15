package repo

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CourseProgressRepo struct {
	db *gorm.DB
}

var _ domain.CourseProgressRepo = (*CourseProgressRepo)(nil)

func NewCourseProgressRepo(db *gorm.DB) *CourseProgressRepo {
	return &CourseProgressRepo{db: db}
}

func (r *CourseProgressRepo) Get(ctx context.Context, params domain.CourseProgressRepoGet, forUpdate bool) (*domain.CourseProgress, error) {
	db := r.db.WithContext(ctx)
	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.CourseProgress
	if err := db.First(&m, "course_id = ? AND user_id = ?", params.CourseID, params.UserID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *CourseProgressRepo) Save(progress *domain.CourseProgress) error {
	m := model.CourseProgressFromDomain(progress)
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"progress", "updated_at"}),
	}).Create(m).Error
}
