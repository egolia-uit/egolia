package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type CreateDraftVersion struct {
	CourseID uuid.UUID
	UserID   string
}

type CreateDraftVersionHandler struct {
	uow domain.UnitOfWork
}

func NewCreateDraftVersionHandler(uow domain.UnitOfWork) *CreateDraftVersionHandler {
	return &CreateDraftVersionHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[CreateDraftVersion] = (*CreateDraftVersionHandler)(nil)

func (h *CreateDraftVersionHandler) Handle(ctx context.Context, cmd *CreateDraftVersion) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		// Bật forUpdate=true để lock row, ngăn chặn Race Condition khi check ExistsDraftVersion
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}

		if course.InstructorID() != cmd.UserID {
			return errs.NewInstructorPermissionDenied(cmd.UserID, cmd.CourseID)
		}
		if course.OriginalCourseID() != nil {
			return errs.NewInvalid("cannot create a draft version from a draft course")
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
