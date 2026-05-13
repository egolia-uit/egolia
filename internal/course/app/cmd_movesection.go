package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type MoveSection struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	Order     int
}

type MoveSectionCmd Cmd[MoveSection]

type MoveSectionHandler struct {
	uow domain.UnitOfWork
}

func NewMoveSectionHandler(logger *slog.Logger, tracer Tracer, uow domain.UnitOfWork) MoveSectionCmd {
	handler := &MoveSectionHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

func (h *MoveSectionHandler) Handle(ctx context.Context, command *MoveSection) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: command.CourseID}, true)
		if err != nil {
			return err
		}
		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}
		course.MoveSection(command.SectionID, command.Order)
		return repoRegistry.Course().Save(ctx, course)
	})
}

var _ Cmd[MoveSection] = (*MoveSectionHandler)(nil)
