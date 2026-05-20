package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type CreateCourse struct {
	ID                   uuid.UUID
	Title                string
	InstructorID         string
	Price                int64
	Overview             string
	IntroductionVideoKey string
}

type CreateCourseHandler struct {
	uow domain.UnitOfWork
}

func NewCreateCourseHandler(
	uow domain.UnitOfWork,
) *CreateCourseHandler {
	return &CreateCourseHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[CreateCourse] = (*CreateCourseHandler)(nil)

func (h *CreateCourseHandler) Handle(ctx context.Context, cmd *CreateCourse) error {
	course, err := domain.NewCourse(
		cmd.ID,
		cmd.Title,
		cmd.InstructorID,
		cmd.Price,
		cmd.Overview,
		cmd.IntroductionVideoKey,
	)
	if err != nil {
		return err
	}
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		return repoRegistry.Course().Save(ctx, course)
	})
}
