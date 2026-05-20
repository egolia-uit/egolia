package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetMyBookmarkedCourses struct {
	UserID   string
	Paginate PaginationParams
	Order    *SearchCoursesOrder
	Hidden   *bool
	Status   *CourseStatus
}

type GetMyBookmarkedCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetMyBookmarkedCoursesHandler(readModel GetCoursesReadModel) *GetMyBookmarkedCoursesHandler {
	return &GetMyBookmarkedCoursesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetMyBookmarkedCourses, *Paginated[Course]] = (*GetMyBookmarkedCoursesHandler)(nil)

func (h *GetMyBookmarkedCoursesHandler) Handle(ctx context.Context, params *GetMyBookmarkedCourses) (*Paginated[Course], error) {
	status := CourseStatusApproved
	params.Status = &status
	hidden := false
	params.Hidden = &hidden

	return h.readModel.GetMyBookmarkedCourses(ctx, params)
}
