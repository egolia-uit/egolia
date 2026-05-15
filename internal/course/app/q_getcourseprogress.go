package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type GetCourseProgress struct {
	CourseID uuid.UUID
	UserID   string
}

type GetCourseProgressCmd Cmd[GetCourseProgress]

type GetCourseProgressHandler struct {
	uow domain.UnitOfWork
}

func NewGetCourseProgressHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) GetCourseProgressCmd {
	handler := &GetCourseProgressHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[GetCourseProgress] = (*GetCourseProgressHandler)(nil)

func (h *GetCourseProgressHandler) Handle(ctx context.Context, cmd *GetCourseProgress) error {
	// return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
	// 	course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, false)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	progress,err := repoRegistry.CourseProgress().Get(ctx,)
	// })
	return nil
}
