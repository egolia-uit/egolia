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

func (s *EnrollInCourseSvc) Handle(ctx context.Context, course *Course, learnerID string, enrollRepo EnrollmentRepo) (*Enrollment, error) {
	if learnerID == "" {
		return nil, errs.NewInvalid("learner id is required")
	}

	hasEnrolled, err := enrollRepo.ExistsByCourseAndLearner(ctx, course.ID(), learnerID)
	if err != nil {
		return nil, err
	}
	if hasEnrolled {
		return nil, errs.NewInvalid("learner has already enrolled in this course")
	}

	enrollmentID := uuid.New()
	enrollment := NewEnrollment(enrollmentID, learnerID, course.ID(), time.Now())
	return enrollment, nil
}
