package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
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
	var err error

	switch {
	case params.ID != uuid.Nil:
		err = db.First(&m, "id = ?", params.ID).Error

	case params.SectionID != uuid.Nil:
		err = db.Joins("JOIN sections ON sections.course_id = courses.id AND sections.id = ? AND sections.deleted_at IS NULL", params.SectionID).
			First(&m).Error

	case params.LessonID != uuid.Nil:
		err = db.Where(
			"id IN (SELECT course_id FROM sections WHERE deleted_at IS NULL AND id IN "+
				"(SELECT section_id FROM lessons WHERE id = ? AND deleted_at IS NULL))",
			params.LessonID,
		).First(&m).Error
	}

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

	// Rebuild read_courses JSONB in the same transaction so reads are never stale.
	readModel := model.ReadCourseFromDomain(course)
	return db.Save(readModel).Error
}
