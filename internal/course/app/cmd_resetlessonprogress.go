package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type ResetLessonProgress struct {
	LessonID uuid.UUID
}

type ResetLessonProgressHandler struct {
	uow domain.UnitOfWork
}

func NewResetLessonProgressHandler(uow domain.UnitOfWork) *ResetLessonProgressHandler {
	return &ResetLessonProgressHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[ResetLessonProgress] = (*ResetLessonProgressHandler)(nil)

func (h *ResetLessonProgressHandler) Handle(ctx context.Context, cmd *ResetLessonProgress) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		return repoRegistry.LessonProgress().ResetByLessonID(ctx, cmd.LessonID)
	})
}
