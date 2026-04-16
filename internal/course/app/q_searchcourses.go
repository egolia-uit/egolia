package app

import "context"

type SearchCourses struct {
	Query    string // emptyable?
	Paginate PaginationParams
}

type SearchCoursesReadModel interface {
	SearchCourses(ctx context.Context, params *SearchCourses) (*Paginated[Course], error)
}

type SearchCoursesHandler struct {
	readModel SearchCoursesReadModel
}

func NewSearchCoursesHandler(readModel SearchCoursesReadModel) *SearchCoursesHandler {
	return &SearchCoursesHandler{
		readModel: readModel,
	}
}

func (h *SearchCoursesHandler) Handle(ctx context.Context, params *SearchCourses) (*Paginated[Course], error) {
	return h.readModel.SearchCourses(ctx, params)
}
