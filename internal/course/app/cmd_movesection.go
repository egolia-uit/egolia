package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type MoveSection struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	Order     int
}

type MoveSectionHandler struct {
	uow domain.UnitOfWork
}

func NewMoveSectionHandler(uow domain.UnitOfWork) *MoveSectionHandler {
	return &MoveSectionHandler{
		uow: uow,
	}
}

func (h *MoveSectionHandler) Handle(ctx context.Context, command *MoveSection) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, command.CourseID)
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

var _ commonhandler.Cmd[MoveSection] = (*MoveSectionHandler)(nil)
