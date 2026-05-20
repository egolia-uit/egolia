package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetMyEnrolledCourses struct {
	LearnerID string
	Paginate  PaginationParams
	Order     *SearchCoursesOrder
	Hidden    *bool
	Status    *CourseStatus
}

type GetMyEnrolledCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyEnrolledCoursesHandler(readModel GetCoursesReadModel) *GetMyEnrolledCoursesHandler {
	return &GetMyEnrolledCoursesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetMyEnrolledCourses, *Paginated[Course]] = (*GetMyEnrolledCoursesHandler)(nil)

func (h *GetMyEnrolledCoursesHandler) Handle(ctx context.Context, params *GetMyEnrolledCourses) (*Paginated[Course], error) {
	status := CourseStatusApproved
	params.Status = &status
	hidden := false
	params.Hidden = &hidden

	return h.readModel.GetMyEnrolledCourses(ctx, params)
}
