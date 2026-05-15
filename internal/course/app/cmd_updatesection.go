package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type UpdateSectionTitle struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	UserID    string
	Title     string
}

type UpdateSectionTitleCmd Cmd[UpdateSectionTitle]

type UpdateSectionTitleHandler struct {
	uow domain.UnitOfWork
}

func NewUpdateSectionTitleHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) UpdateSectionTitleCmd {
	handler := &UpdateSectionTitleHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[UpdateSectionTitle] = (*UpdateSectionTitleHandler)(nil)

func (h *UpdateSectionTitleHandler) Handle(ctx context.Context, command *UpdateSectionTitle) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: command.CourseID}, false)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		if course.ExistsSectionWithTitle(command.Title) {
			return errs.NewSectionTitleAlreadyExists(command.Title)
		}

		section := course.GetSection(command.SectionID)
		if section == nil {
			return errs.NewSectionNotFound(command.SectionID)
		}
		section.SetTitle(command.Title)

		return repoRegistry.Course().Save(ctx, course)
	})
}
