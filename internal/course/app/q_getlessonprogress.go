package app

import (
	"context"

	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetLessonProgress struct {
	UserID   string
	LessonID uuid.UUID
}

type GetLessonProgressHandler struct {
	readModel GetLessonProgressReadModel
}

func NewGetLessonProgressHandler(readModel GetLessonProgressReadModel) *GetLessonProgressHandler {
	return &GetLessonProgressHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetLessonProgress, LessonProgress] = (*GetLessonProgressHandler)(nil)

func (h *GetLessonProgressHandler) Handle(ctx context.Context, query *GetLessonProgress) (LessonProgress, error) {
	return h.readModel.GetLessonProgress(ctx, query)
}
