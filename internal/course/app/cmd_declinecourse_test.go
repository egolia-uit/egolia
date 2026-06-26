package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestDeclineCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()

	tests := []struct {
		name    string
		setup   func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "pending course -> course deleted, Save",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", "user-1", domain.CourseStatusPending, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockCourse.EXPECT().Save(ctx, mock.MatchedBy(func(c *domain.Course) bool {
					return c.DeletedAt() != nil
				})).Return(nil)
				return mockCourse
			},
			wantErr: require.NoError,
		},
		{
			name: "not pending course -> error",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", "user-1", domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				return mockCourse
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var invalid *errs.Invalid
				require.ErrorAs(tt, err, &invalid)
			},
		},
		{
			name: "course not found -> error",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(nil, nil)
				return mockCourse
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var courseNotFound *errs.CourseNotFound
				require.ErrorAs(tt, err, &courseNotFound)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			reg := newRepoRegistry(t)
			uow := &mockUow{reg: reg}
			_ = tc.setup(t, reg)
			handler := app.NewDeclineCourseHandler(uow)
			err := handler.Handle(ctx, &app.DeclineCourse{
				CourseID: courseID,
			})
			tc.wantErr(t, err)
		})
	}
}
