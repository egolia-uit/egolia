package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CourseRepo struct {
	db               *gorm.DB
	objectStorageSvc app.ObjectStorageSvc
}

func NewCourseRepo(db *gorm.DB, objectStorageSvc app.ObjectStorageSvc) *CourseRepo {
	return &CourseRepo{db: db, objectStorageSvc: objectStorageSvc}
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

	// Rebuild read_courses JSONB in the same transaction so reads are never stale.
	readModel, err := model.ReadCourseFromDomain(course, func(videoKey string) (string, error) {
		return r.objectStorageSvc.VideoKeyToURL(ctx, videoKey)
	})
	if err != nil {
		return err
	}
	return db.Save(readModel).Error
}
