package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type UpdateSectionTitle struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	UserID    string
	Title     string
}

type UpdateSectionTitleHandler struct {
	uow domain.UnitOfWork
}

func NewUpdateSectionTitleHandler(uow domain.UnitOfWork) *UpdateSectionTitleHandler {
	return &UpdateSectionTitleHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[UpdateSectionTitle] = (*UpdateSectionTitleHandler)(nil)

func (h *UpdateSectionTitleHandler) Handle(ctx context.Context, command *UpdateSectionTitle) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, command.CourseID)
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
