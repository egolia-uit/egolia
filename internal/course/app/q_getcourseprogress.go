package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetCourseProgress struct {
	CourseID uuid.UUID
	UserID   string
}

type GetCourseProgressQuery Query[GetCourseProgress, *CourseProgress]

type GetCourseProgressHandler struct {
	readModel GetCourseProgressReadModel
}

func NewGetCourseProgressHandler(readModel GetCourseProgressReadModel, logger *slog.Logger, tracer Tracer) GetCourseProgressQuery {
	handler := &GetCourseProgressHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourseProgress, *CourseProgress] = (*GetCourseProgressHandler)(nil)

func (h *GetCourseProgressHandler) Handle(ctx context.Context, query *GetCourseProgress) (*CourseProgress, error) {
	return h.readModel.GetCourseProgress(ctx, query)
}
