package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type GetLessonProgress struct {
	UserID   string
	LessonID uuid.UUID
}

type GetLessonProgressQuery Query[GetLessonProgress, domain.LessonProgress]

type GetLessonProgressHandler struct {
	uow domain.UnitOfWork
}

func NewGetLessonProgressHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) GetLessonProgressQuery {
	handler := &GetLessonProgressHandler{
		uow: uow,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetLessonProgress, domain.LessonProgress] = (*GetLessonProgressHandler)(nil)

func (h *GetLessonProgressHandler) Handle(ctx context.Context, query *GetLessonProgress) (domain.LessonProgress, error) {
	var result domain.LessonProgress

	err := h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonProgress, err := repoRegistry.LessonProgress().GetByUserIDAndLesson(ctx, query.UserID, query.LessonID)
		if err != nil {
			return err
		}
		result = lessonProgress
		return nil
	})
	return result, err
}
