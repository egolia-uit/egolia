package domain_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestFinishCourseSvc_Handle(t *testing.T) {
	t.Parallel()

	now := time.Now()

	tests := []struct {
		name       string
		learnerID  string
		enrollment *domain.Enrollment
		wantErr    bool
	}{
		{
			name:      "same learner",
			learnerID: "learner-1",
			enrollment: domain.NewEnrollment(
				uuid.New(), "learner-1", uuid.New(), now,
			),
			wantErr: false,
		},
		{
			name:      "different learner",
			learnerID: "learner-2",
			enrollment: domain.NewEnrollment(
				uuid.New(), "learner-1", uuid.New(), now,
			),
			wantErr: true,
		},
		{
			name:       "nil enrollment",
			learnerID:  "learner-1",
			enrollment: nil,
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			svc := domain.NewFinishCourseSvc()
			params := &domain.FinishCourse{
				Enrollment: tt.enrollment,
				LearnerID:  tt.learnerID,
			}
			err := svc.Handle(params)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.NotNil(t, tt.enrollment.CompletedAt())
			}
		})
	}
}
