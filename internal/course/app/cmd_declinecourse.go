package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type DeclineCourse struct {
	CourseID uuid.UUID
}

type DeclineCourseCmd Cmd[DeclineCourse]

type DeclineCourseHandler struct {
	uow domain.UnitOfWork
}

func NewDeclineCourseHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) DeclineCourseCmd {
	handler := &DeclineCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[DeclineCourse] = (*DeclineCourseHandler)(nil)

func (h *DeclineCourseHandler) Handle(ctx context.Context, cmd *DeclineCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, true)
		if err != nil {
			return err
		}
		if course == nil {
			return errs.NewCourseNotFound(cmd.CourseID, err)
		}
		if course.Status() != domain.CourseStatusPending {
			return errs.NewInvalid("only pending course can be declined")
		}

		course.Delete()

		err = repoRegistry.Course().Save(ctx, course)
		if err != nil {
			return err
		}
		return nil
	})
}
