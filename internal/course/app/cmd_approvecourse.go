package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type ApproveCourse struct {
	CourseID uuid.UUID
}

type ApproveCourseCmd Cmd[ApproveCourse]

type ApproveCourseHandler struct {
	uow domain.UnitOfWork
}

func NewApproveCourseHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) ApproveCourseCmd {
	handler := &ApproveCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[ApproveCourse] = (*ApproveCourseHandler)(nil)

func (h *ApproveCourseHandler) Handle(ctx context.Context, cmd *ApproveCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, true)
		if err != nil {
			return errs.NewCourseNotFound(cmd.CourseID, err)
		}
		originalCourse, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: *course.OriginalCourseID(),
		}, true)
		if err != nil {
			return errs.NewCourseNotFound(*course.OriginalCourseID(), err)
		}

		if err := originalCourse.Merge(course); err != nil {
			return err
		}
		if err := repoRegistry.Course().Save(ctx, originalCourse); err != nil {
			return err
		}
		return nil
	})
}
