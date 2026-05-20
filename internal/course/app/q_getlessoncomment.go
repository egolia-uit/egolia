package app

import (
	"context"

	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetLessonComments struct {
	LessonID uuid.UUID
}

type GetLessonCommentsHandler struct {
	readModel GetLessonCommentsReadModel
}

func NewGetLessonCommentsHandler(readModel GetLessonCommentsReadModel) *GetLessonCommentsHandler {
	return &GetLessonCommentsHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetLessonComments, []*LessonComment] = (*GetLessonCommentsHandler)(nil)

func (h *GetLessonCommentsHandler) Handle(ctx context.Context, query *GetLessonComments) ([]*LessonComment, error) {
	return h.readModel.GetLessonComments(ctx, query)
}
