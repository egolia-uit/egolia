package domain

import "github.com/egolia-uit/egolia/internal/course/errs"

type ReviewPolicySvc struct{}

func NewReviewPolicySvc(courseRepo CourseRepo, enrollmentRepo EnrollmentRepo, reviewRepo ReviewRepo) *ReviewPolicySvc {
	return &ReviewPolicySvc{}
}

func (s *ReviewPolicySvc) Handle(course Course, hasEnrolled bool, hasReviewed bool) error {
	if !hasEnrolled {
		return errs.NewInvalid("learner has not enrolled in this course")
	}

	if hasReviewed {
		return errs.NewInvalid("learner has already reviewed this course")
	}

	return nil
}
