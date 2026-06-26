package domain_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestEnrollInCourseSvc_Handle(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		learnerID  string
		setupMocks func(*domain.MockEnrollmentRepo, *domain.Course)
		wantErr    bool
	}{
		{
			name:      "new enrollment",
			learnerID: "learner-1",
			setupMocks: func(me *domain.MockEnrollmentRepo, c *domain.Course) {
				me.On("ExistsByCourseAndLearner", mock.Anything, c.ID(), "learner-1").Return(false, nil)
			},
			wantErr: false,
		},
		{
			name:      "already enrolled",
			learnerID: "learner-1",
			setupMocks: func(me *domain.MockEnrollmentRepo, c *domain.Course) {
				me.On("ExistsByCourseAndLearner", mock.Anything, c.ID(), "learner-1").Return(true, nil)
			},
			wantErr: true,
		},
		{
			name:      "empty learner id",
			learnerID: "",
			setupMocks: func(me *domain.MockEnrollmentRepo, c *domain.Course) {
				// no repo calls expected
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			mockEnroll := domain.NewMockEnrollmentRepo(t)
			course, err := domain.NewCourse(uuid.New(), "Test", "instructor-1", 1000, "desc", "video")
			require.NoError(t, err)
			tt.setupMocks(mockEnroll, course)

			svc := domain.NewEnrollInCourseSvc()
			enrollment, err := svc.Handle(ctx, course, tt.learnerID, mockEnroll)
			if tt.wantErr {
				require.Error(t, err)
				require.Nil(t, enrollment)
			} else {
				require.NoError(t, err)
				require.NotNil(t, enrollment)
				require.Equal(t, tt.learnerID, enrollment.LearnerID())
				require.Equal(t, course.ID(), enrollment.CourseID())
			}
		})
	}
}
