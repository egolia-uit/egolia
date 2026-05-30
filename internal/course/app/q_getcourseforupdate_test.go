package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestGetCourseForUpdateHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	userID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetCourseDetailReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> returns detail",
			setup: func(t *testing.T) *app.MockGetCourseDetailReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseDetailReadModel(t)
				deleted := false
				status := app.CourseStatusDraft
				mockRead.EXPECT().GetCourseDetailForUpdate(ctx, courseID, &deleted, &status).Return(&app.CourseDetail{
					Course: app.Course{
						ID:                   uuid.UUID{},
						OriginalCourseID:     uuid.UUID{},
						Hidden:               false,
						Title:                "",
						InstructorID:         "",
						Status:               app.CourseStatus(""),
						Price:                0,
						Overview:             "",
						IntroductionVideoKey: nil,
						IntroductionVideoURL: nil,
					},
					Sections: nil,
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "nil result -> DraftCourseNotFound error",
			setup: func(t *testing.T) *app.MockGetCourseDetailReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseDetailReadModel(t)
				deleted := false
				status := app.CourseStatusDraft
				mockRead.EXPECT().GetCourseDetailForUpdate(ctx, courseID, &deleted, &status).Return(nil, nil)
				return mockRead
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.ErrorIs(tt, err, errs.DraftCourseNotFound)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetCourseForUpdateHandler(nil, mockRead)
			result, err := handler.Handle(ctx, &app.GetCourseForUpdate{
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
