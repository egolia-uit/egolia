package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UpdateCourse struct {
	CourseID             uuid.UUID
	Title                string // emptyable
	Price                int64  // emptyable
	Overview             string // emptyable
	IntroductionVideoKey string // emptyable
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

	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}

		if cmd.Title != "" {
			if err := course.SetTitle(cmd.Title); err != nil {
				return err
			}
		}
		if cmd.Price != 0 {
			if err := course.SetPrice(float64(cmd.Price)); err != nil {
				return err
			}
		}
		if cmd.Overview != "" {
			course.SetOverview(cmd.Overview)
		}
		if cmd.IntroductionVideoKey != "" {
			course.SetIntroductionVideoKey(cmd.IntroductionVideoKey)
		}

		return repoRegistry.Course().Save(ctx, course)
	})
}
