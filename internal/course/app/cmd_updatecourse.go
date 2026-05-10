package app

import (
	"context"
	"errors"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
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

type UpdateCourseCmd Cmd[UpdateCourse]

type UpdateCourseHandler struct {
	uow domain.UnitOfWork
}

func NewUpdateCourseHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) UpdateCourseCmd {
	handler := &UpdateCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[UpdateCourse] = (*UpdateCourseHandler)(nil)

func (h *UpdateCourseHandler) Handle(ctx context.Context, cmd *UpdateCourse) error {

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
		course.SetTitle(cmd.Title)
		course.SetPrice(cmd.Price)
		if cmd.Overview != nil {
			course.SetOverview(*cmd.Overview)
		}
		if cmd.IntroductionVideoKey != nil {
			course.SetIntroductionVideoKey(*cmd.IntroductionVideoKey)
		}

		return repoRegistry.Course().Save(ctx, course)
	})
}
