package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetCourseLandingPage struct {
	CourseID uuid.UUID
}

type GetCourseLandingPageQuery Query[GetCourseLandingPage, *Course]

type GetCourseLandingPageHandler struct {
	readModel GetCoursesReadModel
}

func NewGetCourseLandingPageHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetCourseLandingPageQuery {
	handler := &GetCourseLandingPageHandler{readModel: readModel}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourseLandingPage, *Course] = (*GetCourseLandingPageHandler)(nil)

func (h *GetCourseLandingPageHandler) Handle(ctx context.Context, query *GetCourseLandingPage) (*Course, error) {
	return h.readModel.GetCourseByID(ctx, query.CourseID)
}
