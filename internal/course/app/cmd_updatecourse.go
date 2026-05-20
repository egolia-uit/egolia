package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UpdateCourse struct {
	CourseID             uuid.UUID
	Title                string
	Price                int64
	Overview             *string // emptyable
	IntroductionVideoKey *string // emptyable
}

type UpdateCourseHandler struct {
	uow domain.UnitOfWork
}

func NewUpdateCourseHandler(uow domain.UnitOfWork) *UpdateCourseHandler {
	return &UpdateCourseHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[UpdateCourse] = (*UpdateCourseHandler)(nil)

func (h *UpdateCourseHandler) Handle(ctx context.Context, cmd *UpdateCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}
		if err := course.SetTitle(cmd.Title); err != nil {
			return err
		}
		if err := course.SetPrice(cmd.Price); err != nil {
			return err
		}
		if cmd.Overview != nil {
			if err := course.SetOverview(*cmd.Overview); err != nil {
				return err
			}
		}
		if cmd.IntroductionVideoKey != nil {
			if err := course.SetIntroductionVideoKey(*cmd.IntroductionVideoKey); err != nil {
				return err
			}
		}

		return repoRegistry.Course().Save(ctx, course)
	})
}
