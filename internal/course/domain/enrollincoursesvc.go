package domain

import (
	"context"
	"time"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type EnrollInCourseSvc struct{}

func NewEnrollInCourseSvc() *EnrollInCourseSvc {
	return &EnrollInCourseSvc{}
}

type EnrollInCourse struct {
	Course    *Course
	LearnerID string
}

func (s *EnrollInCourseSvc) Handle(ctx context.Context, params *EnrollInCourse) (*Enrollment, error) {
	if params.LearnerID == "" {
		return nil, errs.NewInvalid("learner id is required")
	}

	enrollmentID := uuid.New()
	enrollment := NewEnrollment(enrollmentID, params.LearnerID, params.Course.ID(), time.Now())
	return enrollment, nil
}
