package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type DeleteSection struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	UserID    string
}

type DeleteSectionCmd Cmd[DeleteSection]

type DeleteSectionHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteSectionHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) DeleteSectionCmd {
	handler := &DeleteSectionHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[DeleteSection] = (*DeleteSectionHandler)(nil)

func (h *DeleteSectionHandler) Handle(ctx context.Context, cmd *DeleteSection) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		course.DeleteSection(cmd.SectionID)

		return repoRegistry.Course().Save(ctx, course)
	})
}
