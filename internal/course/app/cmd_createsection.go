package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CreateSection struct {
	CourseID uuid.UUID
	Title    string
}

type CreateSectionHandler struct {
	uow domain.UnitOfWork
}

func NewCreateSectionHandler(uow domain.UnitOfWork) *CreateSectionHandler {
	return &CreateSectionHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[CreateSection] = (*CreateSectionHandler)(nil)

func (h *CreateSectionHandler) Handle(ctx context.Context, cmd *CreateSection) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
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
			nil,
		)

		course.AddSection(newSection)

		return repoRegistry.Course().Save(ctx, course)
	})
}
