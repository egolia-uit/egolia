package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type DeleteLesson struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	LessonID  uuid.UUID
	UserID    string
}

type DeleteLessonCmd Cmd[DeleteLesson]

type DeleteLessonHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteLessonHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) DeleteLessonCmd {
	handler := &DeleteLessonHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[DeleteLesson] = (*DeleteLessonHandler)(nil)

func (h *DeleteLessonHandler) Handle(ctx context.Context, cmd *DeleteLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, false)

		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		course.DeleteLesson(cmd.SectionID, cmd.LessonID)

		return repoRegistry.Course().Save(ctx, course)
	})
}
