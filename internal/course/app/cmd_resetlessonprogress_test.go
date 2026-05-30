package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestResetLessonProgressHandler(t *testing.T) {
	t.Parallel()

	lessonID := uuid.New()

	t.Run("valid -> ResetByLessonID called", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		mockProgress.EXPECT().ResetByLessonID(ctx, lessonID).Return(nil)

		handler := app.NewResetLessonProgressHandler(uow)
		err := handler.Handle(ctx, &app.ResetLessonProgress{
			LessonID: lessonID,
		})
		require.NoError(t, err)
	})

	t.Run("progress not found -> no error", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		mockProgress.EXPECT().ResetByLessonID(ctx, lessonID).Return(nil)

		handler := app.NewResetLessonProgressHandler(uow)
		err := handler.Handle(ctx, &app.ResetLessonProgress{
			LessonID: lessonID,
		})
		require.NoError(t, err)
	})
}
