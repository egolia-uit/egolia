package app_test

import (
	"context"
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockMarkCompletedCmd is a test double for commonhandler.Cmd[app.MarkLessonAsCompleted].
type mockMarkCompletedCmd struct {
	mock.Mock
}

func (m *mockMarkCompletedCmd) Handle(ctx context.Context, cmd *app.MarkLessonAsCompleted) error {
	args := m.Called(ctx, cmd)
	return args.Error(0)
}

func TestSaveVideoLessonProgressHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	learnerID := "learner-1"
	lessonID := uuid.New()

	t.Run("new progress -> save created", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		mockProgress.EXPECT().GetByUserIDAndLesson(ctx, learnerID, lessonID).Return(nil, nil)
		mockProgress.EXPECT().Save(ctx, mock.Anything).Return(nil)

		markCompleted := &mockMarkCompletedCmd{}
		markCompleted.On("Handle", mock.Anything, mock.Anything).Return(nil)

		handler := app.NewSaveVideoLessonProgressHandler(uow, markCompleted)
		err := handler.Handle(ctx, &app.SaveVideoLessonProgress{
			UserID:         learnerID,
			CourseID:       courseID,
			LessonID:       lessonID,
			WatchedSeconds: nil,
			LastViewedAt:   time.Now(),
			IsCompleted:    false,
		})
		require.NoError(t, err)
	})

	t.Run("existing progress -> save update", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		existingID := uuid.New()
		existing := domain.NewLessonProgressVideo(existingID, learnerID, lessonID, nil, time.Now())

		mockProgress.EXPECT().GetByUserIDAndLesson(ctx, learnerID, lessonID).Return(existing, nil)
		mockProgress.EXPECT().Save(ctx, mock.MatchedBy(func(lp domain.LessonProgress) bool {
			return lp.ID() == existingID
		})).Return(nil)

		markCompleted := &mockMarkCompletedCmd{}
		markCompleted.On("Handle", mock.Anything, mock.Anything).Return(nil)

		handler := app.NewSaveVideoLessonProgressHandler(uow, markCompleted)
		err := handler.Handle(ctx, &app.SaveVideoLessonProgress{
			UserID:         learnerID,
			CourseID:       courseID,
			LessonID:       lessonID,
			WatchedSeconds: nil,
			LastViewedAt:   time.Now(),
			IsCompleted:    false,
		})
		require.NoError(t, err)
	})
}
