package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
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
			DoUpdates: clause.AssignmentColumns([]string{"is_completed", "deleted_at", "updated_at"}),
		}).
		Create(m).Error
}
