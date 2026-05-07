package app

import (
	"context"
	"log/slog"
)

type GetCourses struct {
	Status   *CourseStatus
	Hidden   *bool
	Paginate PaginationParams
	Order    SearchCoursesOrder
}

type GetCoursesQuery Query[GetCourses, *Paginated[Course]]

type GetCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetCoursesHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetCoursesQuery {
	handler := &GetCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourses, *Paginated[Course]] = (*GetCoursesHandler)(nil)

func (h *GetCoursesHandler) Handle(ctx context.Context, params *GetCourses) (*Paginated[Course], error) {
	return h.readModel.GetCourses(ctx, params)
}
