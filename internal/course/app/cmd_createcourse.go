package app

import (
	"context"
	"log/slog"

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

type CreateCourseCmd Cmd[CreateCourse]

type CreateCourseHandler struct {
	createCourseSvc *domain.CreateCourseSvc
	uow             domain.UnitOfWork
}

func NewCreateCourseHandler(
	createCourseSvc *domain.CreateCourseSvc,
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) CreateCourseCmd {
	handler := &CreateCourseHandler{
		createCourseSvc: createCourseSvc,
		uow:             uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[CreateCourse] = (*CreateCourseHandler)(nil)

func (h *CreateCourseHandler) Handle(ctx context.Context, cmd *CreateCourse) error {
	course, err := h.createCourseSvc.Handle(&domain.CreateCourse{
		ID:               cmd.ID,
		Title:            cmd.Title,
		OriginalCourseID: uuid.Nil,
		InstructorID:     cmd.InstructorID,
		Price:            float64(cmd.Price),
		Overview:         cmd.Overview,
		Hidden:           false,
		Introduction:     domain.NewCourseLandingPageIntroduction(cmd.Introduction.VideoUrl),
	})
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
