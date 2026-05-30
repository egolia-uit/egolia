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

func TestMoveLessonCmdHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	lessonID := uuid.New()
	targetSectionID := uuid.New()

	tests := []struct {
		name    string
		setup   func(t *testing.T, reg *tSafeRepoRegistry)
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "valid -> course.MoveLesson called, Save",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", "user-1", domain.CourseStatusDraft, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)
			},
			wantErr: require.NoError,
		},
		{
			name: "not editable -> unauthorized",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", "user-1", domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
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
			tc.setup(t, reg)
			handler := app.NewMoveLessonHandler(uow)
			err := handler.Handle(ctx, &app.MoveLesson{
				CourseID:        courseID,
				TargetSectionID: targetSectionID,
				LessonID:        lessonID,
				Order:           0,
			})
			tc.wantErr(t, err)
		})
	}
}
