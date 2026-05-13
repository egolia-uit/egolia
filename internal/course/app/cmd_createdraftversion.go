package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type CreateDraftVersion struct {
	CourseID uuid.UUID
}

type CreateDraftVersionCmd Cmd[CreateDraftVersion]

type CreateDraftVersionHandler struct {
	uow domain.UnitOfWork
}

func NewCreateDraftVersionHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) CreateDraftVersionCmd {
	handler := &CreateDraftVersionHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[CreateDraftVersion] = (*CreateDraftVersionHandler)(nil)

func (h *CreateDraftVersionHandler) Handle(ctx context.Context, cmd *CreateDraftVersion) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, false)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		// check if draft version already exists
		hasDraftVersion, err := repoRegistry.Course().ExistsDraftVersion(ctx, cmd.CourseID)
		if err != nil {
			return err
		}
		if hasDraftVersion {
			return errs.NewInvalid("draft version already exists")
		}

		draftVersion := course.CreateDraftVersion()

		return repoRegistry.Course().Save(ctx, draftVersion)
	})
}
