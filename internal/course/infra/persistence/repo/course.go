package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CourseRepo struct {
	db *gorm.DB
}

func (r *CourseRepo) ExistsDraftVersion(ctx context.Context, originalCourseID uuid.UUID) (bool, error) {
	m := &model.Course{} //nolint:exhaustruct
	var count int64
	err := r.db.WithContext(ctx).Model(m).
		Where("original_course_id = ? AND status = ?", originalCourseID, domain.CourseStatusDraft).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func NewCourseRepo(db *gorm.DB) *CourseRepo {
	return &CourseRepo{db: db}
}

var _ domain.CourseRepo = (*CourseRepo)(nil)

func (r *CourseRepo) Get(ctx context.Context, params domain.CourseRepoGet, forUpdate bool) (*domain.Course, error) {
	db := r.db.WithContext(ctx).
		Preload("Sections.Lessons.VideoLesson").
		Preload("Sections.Lessons.TestLesson.Questions.Answers")

	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.Course

	err := db.First(&m, "id = ?", params.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(params.ID, err)
		}
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *CourseRepo) Save(ctx context.Context, course *domain.Course) error {
	db := r.db.WithContext(ctx)

	m := model.CourseFromDomain(course)
	if err := db.Session(&gorm.Session{FullSaveAssociations: true}).
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(m).Error; err != nil {
		return err
	}

	readModel, err := model.ReadCourseFromDomain(course)
	if err != nil {
		return fmt.Errorf("rebuild read course: %w", err)
	}
	return db.Clauses(clause.OnConflict{UpdateAll: true}).Create(readModel).Error
}

func (r *CourseRepo) GetDraftVersion(ctx context.Context, originalCourseID uuid.UUID, status domain.CourseStatus) (*domain.Course, error) {
	db := r.db.WithContext(ctx).
		Preload("Sections.Lessons.VideoLesson").
		Preload("Sections.Lessons.TestLesson.Questions.Answers")

	var m model.Course
	if err := db.First(&m, "original_course_id = ? AND status = ?", originalCourseID, status).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(originalCourseID, err)
		}
		return nil, err
	}
	return m.ToDomain(), nil
}
