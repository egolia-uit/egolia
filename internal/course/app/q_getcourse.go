package app

import (
	"context"
	"log/slog"
)

type GetCourse struct {
	CourseID string
}

type GetCourseQuery Query[GetCourse, *Course]

type GetCourseHandler struct {
	readModel GetCourseReadModel
}

func NewGetCourseHandler(readModel GetCourseReadModel, logger *slog.Logger, tracer Tracer) GetCourseQuery {
	handler := &GetCourseHandler{readModel: readModel}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourse, *Course] = (*GetCourseHandler)(nil)

func (h *GetCourseHandler) Handle(ctx context.Context, query *GetCourse) (*Course, error) {
	return h.readModel.GetCourse(ctx, query.CourseID)
}
