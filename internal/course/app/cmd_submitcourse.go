package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type SubmitCourse struct {
	CourseID uuid.UUID
	ActorID  string
}

type SubmitCourseCmd Cmd[SubmitCourse]

type SubmitCourseHandler struct {
	uow domain.UnitOfWork
}

func NewSubmitCourseHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) SubmitCourseCmd {
	handler := &SubmitCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[SubmitCourse] = (*SubmitCourseHandler)(nil)

func (h *SubmitCourseHandler) Handle(ctx context.Context, cmd *SubmitCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, true)
		if err != nil {
			return err
		}
		if course.Status() != domain.CourseStatusDraft {
			return errs.NewCourseInvalid("Status", "Course must be in draft status to be submitted")
		}
		course.SetStatus(domain.CourseStatusPending)

		return repoRegistry.Course().Save(ctx, course)
	})
}
