package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetLessonProgress struct {
	UserID   string
	LessonID uuid.UUID
}

type GetLessonProgressQuery Query[GetLessonProgress, LessonProgress]

type GetLessonProgressHandler struct {
	readModel GetLessonProgressReadModel
}

func NewGetLessonProgressHandler(readModel GetLessonProgressReadModel, logger *slog.Logger, tracer Tracer) GetLessonProgressQuery {
	handler := &GetLessonProgressHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetLessonProgress, LessonProgress] = (*GetLessonProgressHandler)(nil)

func (h *GetLessonProgressHandler) Handle(ctx context.Context, query *GetLessonProgress) (LessonProgress, error) {
	return h.readModel.GetLessonProgress(ctx, query)
}
