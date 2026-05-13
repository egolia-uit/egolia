package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type MoveLesson struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	LessonID  uuid.UUID
	Order     int
}

type MoveLessonCmd Cmd[MoveLesson]

type MoveLessonHandler struct {
	uow domain.UnitOfWork
}

func NewMoveLessonHandler(logger *slog.Logger, tracer Tracer, uow domain.UnitOfWork) MoveLessonCmd {
	handler := &MoveLessonHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

func (h *MoveLessonHandler) Handle(ctx context.Context, command *MoveLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: command.CourseID}, true)
		if err != nil {
			return err
		}
		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}
		course.MoveLesson(command.SectionID, command.LessonID, command.Order)
		return repoRegistry.Course().Save(ctx, course)
	})
}

var _ Cmd[MoveLesson] = (*MoveLessonHandler)(nil)
