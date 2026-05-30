package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetSystemCoursesHandler(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetCoursesReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "courses found -> returns all",
			setup: func(t *testing.T) *app.MockGetCoursesReadModel {
				t.Helper()
				mockRead := app.NewMockGetCoursesReadModel(t)
				mockRead.EXPECT().GetCourses(ctx, mock.Anything).Return(&app.Paginated[app.Course]{
					Data: []app.Course{{
						ID:                   uuid.New(),
						Title:                "System Course",
						OriginalCourseID:     uuid.UUID{},
						Hidden:               false,
						InstructorID:         "",
						Status:               "",
						Price:                0,
						Overview:             "",
						IntroductionVideoKey: nil,
						IntroductionVideoURL: nil,
					}},
					Pagination: app.Pagination{Page: 0, Limit: 0, Total: 0, TotalPages: 0, HasNext: false, HasPrev: false},
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "empty -> empty list",
			setup: func(t *testing.T) *app.MockGetCoursesReadModel {
				t.Helper()
				mockRead := app.NewMockGetCoursesReadModel(t)
				mockRead.EXPECT().GetCourses(ctx, mock.Anything).Return(&app.Paginated[app.Course]{Data: []app.Course{}, Pagination: app.Pagination{Page: 0, Limit: 0, Total: 0, TotalPages: 0, HasNext: false, HasPrev: false}}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetSystemCoursesHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetCourses{
				InstructorID:       nil,
				Query:              nil,
				Paginate:           app.PaginationParams{Page: 0, Limit: 0},
				Order:              nil,
				Hidden:             nil,
				Status:             nil,
				HaveOriginalCourse: nil,
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
