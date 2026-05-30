package app_test

import (
	"context"
	"errors"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetCourseLandingPageHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetCoursesReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> returns course (with status/hidden set)",
			setup: func(t *testing.T) *app.MockGetCoursesReadModel {
				t.Helper()
				mockRead := app.NewMockGetCoursesReadModel(t)
				mockRead.EXPECT().GetCourseByID(ctx, mock.Anything).Run(func(_ context.Context, query *app.GetCourseLandingPage) {
					require.NotNil(t, query.Status)
					require.Equal(t, app.CourseStatusApproved, *query.Status)
					require.NotNil(t, query.Hidden)
					require.False(t, *query.Hidden)
				}).Return(&app.Course{
					ID:                   courseID,
					Title:                "Test Course",
					OriginalCourseID:     uuid.UUID{},
					Hidden:               false,
					InstructorID:         "",
					Status:               app.CourseStatus(""),
					Price:                0,
					Overview:             "",
					IntroductionVideoKey: nil,
					IntroductionVideoURL: nil,
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "not found -> error",
			setup: func(t *testing.T) *app.MockGetCoursesReadModel {
				t.Helper()
				mockRead := app.NewMockGetCoursesReadModel(t)
				mockRead.EXPECT().GetCourseByID(ctx, mock.Anything).Return(nil, errors.New("not found"))
				return mockRead
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetCourseLandingPageHandler(mockRead)
			hidden := true
			status := app.CourseStatusDraft
			result, err := handler.Handle(ctx, &app.GetCourseLandingPage{
				CourseID: courseID,
				Status:   &status,
				Hidden:   &hidden,
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
