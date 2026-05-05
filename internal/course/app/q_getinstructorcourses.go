package app

import "context"

type GetInstructorCourses struct {
	InstructorID string
	Paginate     PaginationParams
	Order        SearchCoursesOrder
	Status       *CourseStatus
	Hidden       *bool
}

type GetInstructorCoursesHandler struct {
	readModel GetInstructorCoursesReadModel
}

func NewGetInstructorCoursesHandler(readModel GetInstructorCoursesReadModel) *GetInstructorCoursesHandler {
	return &GetInstructorCoursesHandler{
		readModel: readModel,
	}
}

func (h *GetInstructorCoursesHandler) Handle(ctx context.Context, params *GetInstructorCourses) (*Paginated[Course], error) {
	return h.readModel.GetInstructorCourses(ctx, params)
}
