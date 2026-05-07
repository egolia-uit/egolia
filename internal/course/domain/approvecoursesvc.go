package domain

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/errs"
)

type ApproveCourseSvc struct{}

func NewApproveCourseSvc() *ApproveCourseSvc {
	return &ApproveCourseSvc{}
}

func (s *ApproveCourseSvc) Handle(ctx context.Context, course *Course) error {
	if len(course.Sections()) == 0 {
		return errs.NewInvalid("course must have at least one section to be approved")
	}

	hasLesson := false
	for _, section := range course.Sections() {
		if len(section.Lessons()) > 0 {
			hasLesson = true
			break
		}
	}

	if !hasLesson {
		return errs.NewInvalid("course must have at least one lesson to be approved")
	}

	course.SetStatus(CourseStatusApproved)
	return nil
}
