package app

import (
	"context"
	"log/slog"
)

type SearchCourses struct {
	Query         string
	InstructorIDs []string
	Paginate      PaginationParams
	Order         *SearchCoursesOrder
	Hidden        *bool
	Status        *CourseStatus
}

type SearchCoursesOrder string

const (
	SearchCoursesOrderAsc  SearchCoursesOrder = "asc"
	SearchCoursesOrderDesc SearchCoursesOrder = "desc"
)

type SearchCoursesQuery Query[SearchCourses, *Paginated[Course]]

type SearchCoursesHandler struct {
	readModel SearchCoursesReadModel
}

func NewSearchCoursesHandler(readModel SearchCoursesReadModel, logger *slog.Logger, tracer Tracer) SearchCoursesQuery {
	handler := &SearchCoursesHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[SearchCourses, *Paginated[Course]] = (*SearchCoursesHandler)(nil)

func (h *SearchCoursesHandler) Handle(ctx context.Context, params *SearchCourses) (*Paginated[Course], error) {
	return h.readModel.SearchCourses(ctx, params)
}
