package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
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

type CreateCourseCmd Cmd[CreateCourse]

type CreateCourseHandler struct {
	uow domain.UnitOfWork
}

func NewCreateCourseHandler(
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) CreateCourseCmd {
	handler := &CreateCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[CreateCourse] = (*CreateCourseHandler)(nil)

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
