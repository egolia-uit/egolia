package app

import (
	"context"
	"log/slog"
)

type GetMyEnrolledCourses struct {
	LearnerID string
	Paginate  PaginationParams
	Order     *SearchCoursesOrder
	Hidden    *bool
	Status    *CourseStatus
	Deleted   *bool
}

type GetMyEnrolledCoursesQuery Query[GetMyEnrolledCourses, *Paginated[Course]]

type GetMyEnrolledCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyEnrolledCoursesHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetMyEnrolledCoursesQuery {
	handler := &GetMyEnrolledCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetMyEnrolledCourses, *Paginated[Course]] = (*GetMyEnrolledCoursesHandler)(nil)

func (h *GetMyEnrolledCoursesHandler) Handle(ctx context.Context, params *GetMyEnrolledCourses) (*Paginated[Course], error) {
	status := CourseStatusApproved
	params.Status = &status
	hidden := false
	params.Hidden = &hidden
	deleted := false
	params.Deleted = &deleted

	return h.readModel.GetMyEnrolledCourses(ctx, params)
}
