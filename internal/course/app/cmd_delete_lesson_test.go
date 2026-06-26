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

func TestDeleteLessonHandler(t *testing.T) {
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
		videoLesson := domain.NewVideoLesson(lessonID, "Video", "key", 10*time.Minute)
		section.AddLesson(videoLesson)
		course.AddSection(section)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)

		handler := app.NewDeleteLessonHandler(uow)
		cmd := &app.DeleteLesson{
			CourseID:  courseID,
			SectionID: sectionID,
			LessonID:  lessonID,
			UserID:    "user-1",
		}
		err = handler.Handle(ctx, cmd)
		require.NoError(t, err)
		require.NotNil(t, videoLesson.DeletedAt())
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
		mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)

		handler := app.NewDeleteLessonHandler(uow)
		cmd := &app.DeleteLesson{
			CourseID:  courseID,
			SectionID: sectionID,
			LessonID:  lessonID,
			UserID:    "user-1",
		}
		err = handler.Handle(ctx, cmd)
		require.NoError(t, err)
	})
}
