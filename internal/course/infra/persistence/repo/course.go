package repo

import (
	"context"
	"fmt"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CourseRepo struct {
	db *gorm.DB
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
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *CourseRepo) Save(ctx context.Context, course *domain.Course) error {
	db := r.db.WithContext(ctx)

	m := model.CourseFromDomain(course)
	if err := db.Session(&gorm.Session{FullSaveAssociations: true}).Save(m).Error; err != nil {
		return err
	}

	readModel, err := model.ReadCourseFromDomain(course)
	if err != nil {
		return fmt.Errorf("rebuild read course: %w", err)
	}
	return db.Save(readModel).Error
}
