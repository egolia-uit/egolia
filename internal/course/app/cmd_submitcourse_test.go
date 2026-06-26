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

func TestSubmitCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	actorID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "draft course -> status becomes Pending, Save",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", actorID, domain.CourseStatusDraft, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockCourse.EXPECT().Save(ctx, mock.MatchedBy(func(c *domain.Course) bool {
					return c.Status() == domain.CourseStatusPending
				})).Return(nil)
				return mockCourse
			},
			wantErr: require.NoError,
		},
		{
			name: "non-draft course -> error",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) *domain.MockCourseRepo {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", actorID, domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				return mockCourse
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var courseInvalid *errs.CourseInvalid
				require.ErrorAs(tt, err, &courseInvalid)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			reg := newRepoRegistry(t)
			uow := &mockUow{reg: reg}
			_ = tc.setup(t, reg)
			handler := app.NewSubmitCourseHandler(uow)
			err := handler.Handle(ctx, &app.SubmitCourse{
				CourseID: courseID,
				ActorID:  actorID,
			})
			tc.wantErr(t, err)
		})
	}
}
