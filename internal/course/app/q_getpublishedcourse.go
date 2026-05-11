package app

import (
	"context"
	"log/slog"
)

type GetPublishedCoursesQuery Query[GetCourses, *Paginated[Course]]

type GetPublishedCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetPublishedCoursesHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetPublishedCoursesQuery {
	handler := &GetPublishedCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourses, *Paginated[Course]] = (*GetPublishedCoursesHandler)(nil)

func (h *GetPublishedCoursesHandler) Handle(ctx context.Context, params *GetCourses) (*Paginated[Course], error) {
	status := CourseStatusApproved
	params.Status = &status
	hidden := false
	params.Hidden = &hidden
	deleted := false
	params.Deleted = &deleted

	return h.readModel.GetCourses(ctx, params)
}
