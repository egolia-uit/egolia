package app_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestCreateVideoLessonHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	sectionID := uuid.New()
	lessonID := uuid.New()

	t.Run("valid", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		course.AddSection(section)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)

		handler := app.NewCreateLessonCmd(uow)
		err = handler.Handle(ctx, &app.CreateVideoLesson{
			ID:        lessonID,
			CourseID:  courseID,
			SectionID: sectionID,
			Title:     "New Video",
			VideoKey:  "video-key",
			Duration:  10 * time.Minute,
			UserID:    "user-1",
		})
		require.NoError(t, err)
	})

	t.Run("section not found", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)

		handler := app.NewCreateLessonCmd(uow)
		err = handler.Handle(ctx, &app.CreateVideoLesson{
			ID:        lessonID,
			CourseID:  courseID,
			SectionID: sectionID,
			Title:     "New Video",
			VideoKey:  "video-key",
			Duration:  10 * time.Minute,
			UserID:    "user-1",
		})
		require.Error(t, err)
		var sectionNotFound *errs.SectionNotFound
		require.ErrorAs(t, err, &sectionNotFound)
	})
}
