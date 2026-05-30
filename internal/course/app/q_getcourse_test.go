package app_test

import (
	"errors"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestGetCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	queryCourseID := courseID.String()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetCourseReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> GetCourseReadModel.GetCourse returns course",
			setup: func(t *testing.T) *app.MockGetCourseReadModel {
				t.Helper()
				mock := app.NewMockGetCourseReadModel(t)
				mock.EXPECT().GetCourse(ctx, courseID).Return(&app.Course{
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
				return mock
			},
			wantErr: require.NoError,
		},
		{
			name: "not found -> error",
			setup: func(t *testing.T) *app.MockGetCourseReadModel {
				t.Helper()
				mock := app.NewMockGetCourseReadModel(t)
				mock.EXPECT().GetCourse(ctx, courseID).Return(nil, errors.New("not found"))
				return mock
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetCourseHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetCourse{CourseID: queryCourseID})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
