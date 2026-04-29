package domain

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/errs"
)

type DeleteCourseSvc struct{}

func NewDeleteCourseSvc() *DeleteCourseSvc {
	return &DeleteCourseSvc{}
}

type DeleteCourse struct {
	Course         *Course
	EnrollmentRepo EnrollmentRepo
}

func (s *DeleteCourseSvc) Handle(ctx context.Context, params *DeleteCourse) error {
	if params.EnrollmentRepo == nil {
		return errs.NewInternal("enrollment repo is required")
	}
	hasEnrollment, err := params.EnrollmentRepo.ExistsByCourseID(ctx, params.Course.ID())
	if err != nil {
		return err
	}
	if hasEnrollment {
		return errs.NewCourseHasEnrollment(params.Course.ID())
	}
	params.Course.Delete()
	return nil
}
