package domain_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestReviewPolicySvc_Handle(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		hasEnrolled bool
		hasReviewed bool
		wantErr     bool
	}{
		{
			name:        "enrolled no existing review",
			hasEnrolled: true,
			hasReviewed: false,
			wantErr:     false,
		},
		{
			name:        "not enrolled",
			hasEnrolled: false,
			hasReviewed: false,
			wantErr:     true,
		},
		{
			name:        "already reviewed",
			hasEnrolled: true,
			hasReviewed: true,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			course, err := domain.NewCourse(uuid.New(), "Test", "instructor-1", 1000, "desc", "video")
			require.NoError(t, err)

			svc := domain.NewReviewPolicySvc(nil, nil, nil)
			err = svc.Handle(*course, tt.hasEnrolled, tt.hasReviewed)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
