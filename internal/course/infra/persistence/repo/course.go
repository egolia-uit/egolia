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
	if err := replaceTestLessonQuestions(db, m); err != nil {
		return err
	}

	if err := db.Session(&gorm.Session{FullSaveAssociations: true}).
		Clauses(clause.OnConflict{UpdateAll: true}).
		Create(m).Error; err != nil {
		return err
	}

	if course.DeletedAt() != nil {
		return db.Delete(&model.ReadCourse{}, "course_id = ?", course.ID()).Error //nolint:exhaustruct
	}

	readModel, err := model.ReadCourseFromDomain(course)
	if err != nil {
		return fmt.Errorf("rebuild read course: %w", err)
	}
	return db.Clauses(clause.OnConflict{UpdateAll: true}).Create(readModel).Error
}

func replaceTestLessonQuestions(db *gorm.DB, course *model.Course) error {
	testLessonIDs := make([]uuid.UUID, 0)
	for i := range course.Sections {
		for j := range course.Sections[i].Lessons {
			testLesson := course.Sections[i].Lessons[j].TestLesson
			if testLesson == nil {
				continue
			}
			testLessonIDs = append(testLessonIDs, testLesson.LessonID)
		}
	}
	if len(testLessonIDs) == 0 {
		return nil
	}

	questionIDs := db.Model(&model.TestQuestion{}). //nolint:exhaustruct
							Select("id").
							Where("test_lesson_id IN ?", testLessonIDs)
	if err := db.Where("question_id IN (?)", questionIDs).
		Delete(&model.TestAnswer{}).Error; err != nil { //nolint:exhaustruct
		return err
	}
	return db.Where("test_lesson_id IN ?", testLessonIDs).
		Delete(&model.TestQuestion{}).Error //nolint:exhaustruct
}

func (r *CourseRepo) GetFull(ctx context.Context, id uuid.UUID) (*domain.Course, error) {
	db := r.db.WithContext(ctx).
		Unscoped().
		Preload("Sections", func(db *gorm.DB) *gorm.DB { return db.Unscoped() }).
		Preload("Sections.Lessons", func(db *gorm.DB) *gorm.DB { return db.Unscoped() }).
		Preload("Sections.Lessons.VideoLesson").
		Preload("Sections.Lessons.TestLesson.Questions.Answers")

	var m model.Course
	if err := db.First(&m, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewCourseNotFound(id, err)
		}
		return nil, err
	}
	return m.ToDomain(), nil
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
