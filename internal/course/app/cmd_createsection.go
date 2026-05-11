package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type CreateSection struct {
	CourseID uuid.UUID
	Title    string
}

type CreateSectionCmd Cmd[CreateSection]

type CreateSectionHandler struct {
	uow domain.UnitOfWork
}

func NewCreateSectionHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) CreateSectionCmd {
	handler := &CreateSectionHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[CreateSection] = (*CreateSectionHandler)(nil)

func (h *CreateSectionHandler) Handle(ctx context.Context, cmd *CreateSection) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, false)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		if course.ExistsSectionWithTitle(cmd.Title) {
			return errs.NewSectionTitleAlreadyExists(cmd.Title)
		}

		newSection := domain.NewSection(
			uuid.New(),
			cmd.Title,
		)

		course.AddSection(newSection)

		return repoRegistry.Course().Save(ctx, course)
	})
}
