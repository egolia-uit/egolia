package domain

import (
	"strings"

	"github.com/egolia-uit/egolia/internal/course/errs"
)

type UpdateCourseSvc struct{}

func NewUpdateCourseSvc() *UpdateCourseSvc {
	return &UpdateCourseSvc{}
}

type UpdateCourse struct {
	Course       *Course
	Title        string
	Price        float64
	Overview     string
	Introduction CourseLandingPageIntroduction
}

func (s *UpdateCourseSvc) Handle(params *UpdateCourse) error {
	title := strings.TrimSpace(params.Title)
	if title == "" {
		return errs.NewInvalid("title is required")
	}
	if params.Price < 0 {
		return errs.NewInvalid("price must be greater than or equal to 0")
	}

	params.Course.SetTitle(title)
	params.Course.SetPrice(params.Price)
	params.Course.SetOverview(strings.TrimSpace(params.Overview))
	params.Course.SetIntroduction(params.Introduction)

	return nil
}
