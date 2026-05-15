package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetLessonComments struct {
	LessonID uuid.UUID
}

type GetLessonCommentsQuery Query[GetLessonComments, []*LessonComment]

type GetLessonCommentsHandler struct {
	readModel GetLessonCommentsReadModel
}

func NewGetLessonCommentsHandler(readModel GetLessonCommentsReadModel, logger *slog.Logger, tracer Tracer) GetLessonCommentsQuery {
	handler := &GetLessonCommentsHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetLessonComments, []*LessonComment] = (*GetLessonCommentsHandler)(nil)

func (h *GetLessonCommentsHandler) Handle(ctx context.Context, query *GetLessonComments) ([]*LessonComment, error) {
	return h.readModel.GetLessonComments(ctx, query)
}
