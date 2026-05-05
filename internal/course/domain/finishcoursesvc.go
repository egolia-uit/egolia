package domain

import "github.com/egolia-uit/egolia/internal/course/errs"

type FinishCourseSvc struct{}

func NewFinishCourseSvc() *FinishCourseSvc {
	return &FinishCourseSvc{}
}

type FinishCourse struct {
	Enrollment *Enrollment
	LearnerID  string
}

func (s *FinishCourseSvc) Handle(params *FinishCourse) error {
	if params.Enrollment == nil {
		return errs.NewInvalid("enrollment is required")
	}
	if params.Enrollment.LearnerID() != params.LearnerID {
		return errs.NewInvalid("only the learner can finish the course")
	}
	params.Enrollment.Complete()
	return nil
}
