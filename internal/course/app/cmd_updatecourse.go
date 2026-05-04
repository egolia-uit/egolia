package app

import (
	"context"
	"errors"
	"strings"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UpdateCourse struct {
	CourseID     uuid.UUID
	ActorID      string
	IsAdmin      bool
	Title        string
	Price        int64
	Overview     string
	Introduction CourseLandingPageIntroduction
}

type UpdateCourseHandler struct {
	uow domain.UnitOfWork
}

func NewUpdateCourseHandler(uow domain.UnitOfWork) *UpdateCourseHandler {
	return &UpdateCourseHandler{
		uow: uow,
	}
}

func (h *UpdateCourseHandler) Handle(ctx context.Context, cmd *UpdateCourse) error {
	if h.uow == nil {
		return errs.NewInternal("unit of work is required")
	}

	title := strings.TrimSpace(cmd.Title)
	if title == "" {
		return errs.NewInvalid("title is required")
	}
	if cmd.Price < 0 {
		return errs.NewInvalid("price must be greater than or equal to 0")
	}

	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID:        cmd.CourseID,
			SectionID: uuid.Nil,
			LessonID:  uuid.Nil,
		}, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}
		if !cmd.IsAdmin && course.InstructorID() != cmd.ActorID {
			return errs.NewInstructorPermissionDenied(cmd.ActorID, cmd.CourseID)
		}

		course.SetTitle(title)
		course.SetPrice(float64(cmd.Price))
		course.SetOverview(strings.TrimSpace(cmd.Overview))
		course.SetIntroduction(domain.NewCourseLandingPageIntroduction(cmd.Introduction.VideoUrl))

		return repoRegistry.Course().Save(ctx, course)
	})
}
