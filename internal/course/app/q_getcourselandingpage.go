package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetCourseLandingPage struct {
	CourseID uuid.UUID
	Status   *CourseStatus
	Hidden   *bool
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
	hidden := false
	status := CourseStatusApproved
	return h.readModel.GetCourseByID(ctx, &GetCourseLandingPage{
		CourseID: query.CourseID,
		Status:   &status,
		Hidden:   &hidden,
	})
}
