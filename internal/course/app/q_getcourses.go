package app

import "context"

type GetCourses struct {
	Status   *CourseStatus
	Hidden   *bool
	Paginate PaginationParams
	Order    SearchCoursesOrder
}

type GetCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetCoursesHandler(readModel GetCoursesReadModel) *GetCoursesHandler {
	return &GetCoursesHandler{
		readModel: readModel,
	}
}

func (h *GetCoursesHandler) Handle(ctx context.Context, params *GetCourses) (*Paginated[Course], error) {
	return h.readModel.GetCourses(ctx, params)
}
