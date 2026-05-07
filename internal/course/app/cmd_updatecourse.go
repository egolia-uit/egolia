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
	Title                string // emptyable
	Price                int64  // emptyable
	Overview             string // emptyable
	IntroductionVideoKey string // emptyable
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
			if err := course.SetPrice(cmd.Price); err != nil {
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
