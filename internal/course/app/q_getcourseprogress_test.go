package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetCourseProgressHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	userID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetCourseProgressReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "progress found -> returns progress",
			setup: func(t *testing.T) *app.MockGetCourseProgressReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseProgressReadModel(t)
				mockRead.EXPECT().GetCourseProgress(ctx, mock.Anything).Return(&app.CourseProgress{
					CourseID:         courseID,
					ProgressPercent:  0,
					CompletedLessons: 0,
					TotalLessons:     0,
					IsCompleted:      true,
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "no progress -> empty/zero",
			setup: func(t *testing.T) *app.MockGetCourseProgressReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseProgressReadModel(t)
				mockRead.EXPECT().GetCourseProgress(ctx, mock.Anything).Return(&app.CourseProgress{
					CourseID:         courseID,
					ProgressPercent:  0,
					CompletedLessons: 0,
					TotalLessons:     0,
					IsCompleted:      false,
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetCourseProgressHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetCourseProgress{
				CourseID: courseID,
				UserID:   userID,
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
