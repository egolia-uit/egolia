// service to create course, which is the first step of course creation process. After creating course, instructor can add sections and lessons to the course, and then submit the course for review. The course will be in draft status after creating, and then instructor can submit the course for review. The course will be in pending status after submitting for review, and then admin can approve or reject the course. The course will be in approved or rejected status after admin review.
package domain

import (
	"strings"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type CreateCourseSvc struct{}

func NewCreateCourseSvc() *CreateCourseSvc {
	return &CreateCourseSvc{}
}

type CreateCourse struct {
	ID               uuid.UUID
	Title            string
	OriginalCourseID uuid.UUID
	InstructorID     uuid.UUID
	Price            float64
	Overview         string
	Hidden           bool
	Introduction     CourseLandingPageIntroduction
}

func (s *CreateCourseSvc) Handle(params *CreateCourse) (*Course, error) {
	title := strings.TrimSpace(params.Title)
	if title == "" {
		return nil, errs.NewInvalid("title is required")
	}
	if params.Price < 0 {
		return nil, errs.NewInvalid("price must be greater than or equal to 0")
	}
	course := NewCourse(
		params.ID,
		title,
		params.OriginalCourseID,
		params.InstructorID,
		CourseStatusDraft,
		params.Price,
		strings.TrimSpace(params.Overview),
		params.Hidden,
		params.Introduction,
	)
	return course, nil
}
