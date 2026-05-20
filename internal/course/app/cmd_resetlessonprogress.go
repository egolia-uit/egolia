package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type ResetLessonProgress struct {
	LessonID uuid.UUID
}

type ResetLessonProgressCmd Cmd[ResetLessonProgress]

type ResetLessonProgressHandler struct {
	uow domain.UnitOfWork
}

func NewResetLessonProgressHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) ResetLessonProgressCmd {
	handler := &ResetLessonProgressHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[ResetLessonProgress] = (*ResetLessonProgressHandler)(nil)

func (h *ResetLessonProgressHandler) Handle(ctx context.Context, cmd *ResetLessonProgress) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		return repoRegistry.LessonProgress().ResetByLessonID(ctx, cmd.LessonID)
	})
}
