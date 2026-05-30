package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestDeleteSectionHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	sectionID := uuid.New()

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

		handler := app.NewDeleteSectionHandler(uow)
		cmd := &app.DeleteSection{
			CourseID:  courseID,
			SectionID: sectionID,
			UserID:    "user-1",
		}
		err = handler.Handle(ctx, cmd)
		require.NoError(t, err)
		require.NotNil(t, section.DeletedAt())
	})

	t.Run("section not found", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)

		handler := app.NewDeleteSectionHandler(uow)
		cmd := &app.DeleteSection{
			CourseID:  courseID,
			SectionID: sectionID,
			UserID:    "user-1",
		}
		err = handler.Handle(ctx, cmd)
		require.NoError(t, err)
	})
}
