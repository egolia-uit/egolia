package domain_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestDeleteCourseSvc_Handle(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		setupMocks func(*domain.MockEnrollmentRepo, *domain.Course)
		wantErr    bool
	}{
		{
			name: "no enrollments",
			setupMocks: func(me *domain.MockEnrollmentRepo, c *domain.Course) {
				me.On("ExistsByCourseID", mock.Anything, c.ID()).Return(false, nil)
			},
			wantErr: false,
		},
		{
			name: "has enrollments",
			setupMocks: func(me *domain.MockEnrollmentRepo, c *domain.Course) {
				me.On("ExistsByCourseID", mock.Anything, c.ID()).Return(true, nil)
			},
			wantErr: true,
		},
		{
			name: "repo error",
			setupMocks: func(me *domain.MockEnrollmentRepo, c *domain.Course) {
				me.On("ExistsByCourseID", mock.Anything, c.ID()).Return(false, assert.AnError)
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

			svc := domain.NewDeleteCourseSvc()
			params := &domain.DeleteCourse{
				Course:         course,
				EnrollmentRepo: mockEnroll,
			}
			err = svc.Handle(ctx, params)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.NotNil(t, course.DeletedAt())
			}
		})
	}
}
