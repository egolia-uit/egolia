package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetMyCourses struct {
	Hidden             *bool
	Status             *CourseStatus
	HaveOriginalCourse *bool
	UserID             string
	Paginate           PaginationParams
	Order              *SearchCoursesOrder
}

type GetMyCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyCoursesHandler(readModel GetCoursesReadModel) *GetMyCoursesHandler {
	return &GetMyCoursesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetMyCourses, *Paginated[Course]] = (*GetMyCoursesHandler)(nil)

func (h *GetMyCoursesHandler) Handle(ctx context.Context, params *GetMyCourses) (*Paginated[Course], error) {
	return h.readModel.GetMyCourses(ctx, params)
}
