package repo

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type LessonProgressRepo struct {
	db *gorm.DB
}

func NewLessonProgressRepo(db *gorm.DB) *LessonProgressRepo {
	return &LessonProgressRepo{db: db}
}

var _ domain.LessonProgressRepo = (*LessonProgressRepo)(nil)

func (r *LessonProgressRepo) Save(ctx context.Context, progress domain.LessonProgress) error {
	m := model.LessonProgressFromDomain(progress)
	return r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoUpdates: clause.AssignmentColumns([]string{"lesson_type", "is_completed", "watched_seconds", "last_viewed_at", "deleted_at", "updated_at"}),
		}).
		Create(m).Error
}

func (r *LessonProgressRepo) GetByEnrollmentAndLesson(ctx context.Context, enrollmentID uuid.UUID, lessonID uuid.UUID) (domain.LessonProgress, error) {
	var m model.LessonProgress
	if err := r.db.WithContext(ctx).
		Where("enrollment_id = ? AND lesson_id = ?", enrollmentID, lessonID).
		First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return m.ToDomain(), nil
}
