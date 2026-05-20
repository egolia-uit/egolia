package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetPublishedCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetPublishedCoursesHandler(readModel GetCoursesReadModel) *GetPublishedCoursesHandler {
	return &GetPublishedCoursesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetCourses, *Paginated[Course]] = (*GetPublishedCoursesHandler)(nil)

func (h *GetPublishedCoursesHandler) Handle(ctx context.Context, params *GetCourses) (*Paginated[Course], error) {
	status := CourseStatusApproved
	params.Status = &status
	hidden := false
	params.Hidden = &hidden

	return h.readModel.GetCourses(ctx, params)
}
