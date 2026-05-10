package app

import (
	"context"
	"log/slog"
)

type GetSystemCoursesQuery Query[GetCourses, *Paginated[Course]]

type GetSystemCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetSystemCoursesHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetSystemCoursesQuery {
	handler := &GetSystemCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourses, *Paginated[Course]] = (*GetSystemCoursesHandler)(nil)

func (h *GetSystemCoursesHandler) Handle(ctx context.Context, params *GetCourses) (*Paginated[Course], error) {
	return h.readModel.GetCourses(ctx, params)
}
