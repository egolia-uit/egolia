package app_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestEditVideoLessonHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	sectionID := uuid.New()
	lessonID := uuid.New()
	newTitle := "Updated Title"
	newVideoKey := "new-video-key"
	newDuration := 20 * time.Minute

	t.Run("valid", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		videoLesson := domain.NewVideoLesson(lessonID, "Original Title", "original-key", 10*time.Minute)
		section.AddLesson(videoLesson)
		course.AddSection(section)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)

		handler := app.NewEditVideoLessonHandler(uow)
		cmd := &app.EditVideoLesson{
			CourseID:  courseID,
			SectionID: sectionID,
			LessonID:  lessonID,
			UserID:    "user-1",
			Title:     &newTitle,
			VideoKey:  &newVideoKey,
			Duration:  &newDuration,
		}
		err = handler.Handle(ctx, cmd)
		require.NoError(t, err)
	})

	t.Run("lesson not found", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		course.AddSection(section)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)

		handler := app.NewEditVideoLessonHandler(uow)
		cmd := &app.EditVideoLesson{
			CourseID:  courseID,
			SectionID: sectionID,
			LessonID:  lessonID,
			UserID:    "user-1",
			Title:     &newTitle,
			VideoKey:  &newVideoKey,
			Duration:  &newDuration,
		}
		err = handler.Handle(ctx, cmd)
		require.Error(t, err)
	})
}
