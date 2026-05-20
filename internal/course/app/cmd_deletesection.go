package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type DeleteSection struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	UserID    string
}

type DeleteSectionHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteSectionHandler(uow domain.UnitOfWork) *DeleteSectionHandler {
	return &DeleteSectionHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[DeleteSection] = (*DeleteSectionHandler)(nil)

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
