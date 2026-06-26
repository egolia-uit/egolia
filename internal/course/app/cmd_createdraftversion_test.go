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

func TestCreateDraftVersionHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	instructorID := "instructor-1"
	otherUserID := "other-user"

	tests := []struct {
		name    string
		userID  string
		setup   func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo
		wantErr require.ErrorAssertionFunc
	}{
		{
			name:   "valid original -> create draft version, Save",
			userID: instructorID,
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", instructorID, domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockCourse.EXPECT().ExistsDraftVersion(ctx, courseID).Return(false, nil)
				mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)
				return mockCourse
			},
			wantErr: require.NoError,
		},
		{
			name:   "already has draft -> error",
			userID: instructorID,
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", instructorID, domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockCourse.EXPECT().ExistsDraftVersion(ctx, courseID).Return(true, nil)
				return mockCourse
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var invalid *errs.Invalid
				require.ErrorAs(tt, err, &invalid)
			},
		},
		{
			name:   "draft of draft -> error",
			userID: instructorID,
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				originalID := uuid.New()
				course := domain.UnmarshalCourse(courseID, &originalID, "Test Course", instructorID, domain.CourseStatusDraft, 0, "", false, "", nil, nil)
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
			name:   "wrong instructor -> error",
			userID: otherUserID,
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", instructorID, domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				return mockCourse
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var permDenied *errs.InstructorPermissionDenied
				require.ErrorAs(tt, err, &permDenied)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			reg := newRepoRegistry(t)
			uow := &mockUow{reg: reg}
			_ = tc.setup(t, reg)
			handler := app.NewCreateDraftVersionHandler(uow)
			err := handler.Handle(ctx, &app.CreateDraftVersion{
				CourseID: courseID,
				UserID:   tc.userID,
			})
			tc.wantErr(t, err)
		})
	}
}
