package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type CreateCourse struct {
	ID           uuid.UUID
	Title        string
	InstructorID string
	Price        int64
	Overview     string
	Introduction CourseLandingPageIntroduction
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

func (h *CreateCourseHandler) Handle(ctx context.Context, cmd *CreateCourse) error {
	course, err := domain.NewCourse(
		cmd.ID,
		cmd.Title,
		cmd.InstructorID,
		float64(cmd.Price),
		cmd.Overview,
		"", // FIXME:
	)
	if err != nil {
		return err
	}
	if h.uow == nil {
		return errs.NewInternal("unit of work is required")
	}
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		return repoRegistry.Course().Save(ctx, course)
	})
}
