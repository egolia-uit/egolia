package app

import (
	"context"
	"log/slog"
)

type GetCourseDetail struct {
	CourseID string
}

type GetCourseDetailQuery Query[GetCourseDetail, *CourseDetail]

type GetCourseDetailHandler struct {
	readModel GetCourseDetailReadModel
}

func NewGetCourseDetailHandler(readModel GetCourseDetailReadModel, logger *slog.Logger, tracer Tracer) GetCourseDetailQuery {
	handler := &GetCourseDetailHandler{readModel: readModel}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourseDetail, *CourseDetail] = (*GetCourseDetailHandler)(nil)

func (h *GetCourseDetailHandler) Handle(ctx context.Context, query *GetCourseDetail) (*CourseDetail, error) {
	return h.readModel.GetCourseDetail(ctx, query.CourseID)
}
