package seedcourse

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
)

func (s *Seed) createEnrollments() []model.Enrollment {
	now := time.Now()
	return []model.Enrollment{
		{
			ID:             uuid.MustParse("00000000-0000-0000-0002-000000000001"),
			CourseID:       uuid.MustParse("00000000-0000-0000-0000-000000000001"),
			LearnerID:      "110",
			EnrollmentDate: now,
			CompletedAt:    nil,
			ExpiredAt:      nil,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}
}
