package app

import (
	"context"
	"log/slog"
)

type GetInstructorCourses struct {
	InstructorID string
	Paginate     PaginationParams
	Order        SearchCoursesOrder
	Status       *CourseStatus
	Hidden       *bool
}

type GetInstructorCoursesQuery Query[GetInstructorCourses, *Paginated[Course]]

type GetInstructorCoursesHandler struct {
	readModel GetInstructorCoursesReadModel
}

func NewGetInstructorCoursesHandler(readModel GetInstructorCoursesReadModel, logger *slog.Logger, tracer Tracer) GetInstructorCoursesQuery {
	handler := &GetInstructorCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetInstructorCourses, *Paginated[Course]] = (*GetInstructorCoursesHandler)(nil)

func (h *GetInstructorCoursesHandler) Handle(ctx context.Context, params *GetInstructorCourses) (*Paginated[Course], error) {
	return h.readModel.GetInstructorCourses(ctx, params)
}
