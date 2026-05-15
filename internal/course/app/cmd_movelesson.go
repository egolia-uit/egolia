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

type MoveLesson struct {
	CourseID        uuid.UUID
	TargetSectionID uuid.UUID
	LessonID        uuid.UUID
	Order           int
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
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(command.CourseID, err)
			}
			return err
		}
		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}
		course.MoveLesson(command.LessonID, command.TargetSectionID, command.Order)
		return repoRegistry.Course().Save(ctx, course)
	})
}

var _ Cmd[MoveLesson] = (*MoveLessonHandler)(nil)
