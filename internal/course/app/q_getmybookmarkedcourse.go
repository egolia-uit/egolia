package app

import (
	"context"
	"log/slog"
)

type GetMyBookmarkedCourses struct {
	UserID   string
	Paginate PaginationParams
	Order    *SearchCoursesOrder
	Hidden   *bool
	Status   *CourseStatus
	Deleted  *bool
}

type GetMyBookmarkedCoursesQuery Query[GetMyBookmarkedCourses, *Paginated[Course]]

type GetMyBookmarkedCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyBookmarkedCoursesHandler(readModel GetCoursesReadModel, logger *slog.Logger, tracer Tracer) GetMyBookmarkedCoursesQuery {
	handler := &GetMyBookmarkedCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetMyBookmarkedCourses, *Paginated[Course]] = (*GetMyBookmarkedCoursesHandler)(nil)

func (h *GetMyBookmarkedCoursesHandler) Handle(ctx context.Context, params *GetMyBookmarkedCourses) (*Paginated[Course], error) {
	status := CourseStatusApproved
	params.Status = &status
	hidden := false
	params.Hidden = &hidden
	deleted := false
	params.Deleted = &deleted

	return h.readModel.GetMyBookmarkedCourses(ctx, params)
}
