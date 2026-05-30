package app_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestGetLessonProgressHandler(t *testing.T) {
	t.Parallel()

	lessonID := uuid.New()
	userID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetLessonProgressReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> returns progress",
			setup: func(t *testing.T) *app.MockGetLessonProgressReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonProgressReadModel(t)
				mockRead.EXPECT().GetLessonProgress(ctx, &app.GetLessonProgress{LessonID: lessonID, UserID: userID}).Return(
					app.LessonProgress(&app.VideoLessonProgress{
						LessonProgressBase: app.LessonProgressBase{
							ID: uuid.New(), UserID: userID, LessonID: lessonID, IsCompleted: true,
						},
						WatchedSeconds: nil,
						LastViewedAt:   time.Time{},
					}), nil,
				)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "empty/not found -> zero value",
			setup: func(t *testing.T) *app.MockGetLessonProgressReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonProgressReadModel(t)
				mockRead.EXPECT().GetLessonProgress(ctx, &app.GetLessonProgress{LessonID: lessonID, UserID: userID}).Return(
					app.LessonProgress(nil), nil,
				)
				return mockRead
			},
			wantErr: require.NoError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetLessonProgressHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetLessonProgress{LessonID: lessonID, UserID: userID})
			tc.wantErr(t, err)
			_ = result
		})
	}
}
