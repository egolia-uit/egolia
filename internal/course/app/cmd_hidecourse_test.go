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

func TestHideCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	userID := "user-1"

	tests := []struct {
		name    string
		roles   []app.UserRole
		setup   func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo
		wantErr require.ErrorAssertionFunc
	}{
		{
			name:  "has permission (admin) -> course.Hidden toggled, Save",
			roles: []app.UserRole{app.UserRoleAdmin},
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", userID, domain.CourseStatusDraft, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)
				return mockCourse
			},
			wantErr: require.NoError,
		},
		{
			name:  "no permission -> unauthorized error",
			roles: []app.UserRole{},
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", "other-instructor", domain.CourseStatusDraft, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				mockCourse.EXPECT().Get(ctx, domain.CourseRepoGet{ID: courseID}, false).Return(course, nil)
				return mockCourse
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.ErrorIs(tt, err, errs.Unauthorized)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			reg := newRepoRegistry(t)
			uow := &mockUow{reg: reg}
			mockCourse := tc.setup(t, reg)

			handler := app.NewHideCourseHandler(
				domain.NewAuthorizationSvc(mockCourse, domain.NewMockEnrollmentRepo(t)),
				uow,
			)
			err := handler.Handle(ctx, &app.HideCourse{
				CourseID: courseID,
				UserID:   userID,
				Roles:    tc.roles,
			})
			tc.wantErr(t, err)
		})
	}
}
