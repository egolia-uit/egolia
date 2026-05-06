package app

import "context"

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
