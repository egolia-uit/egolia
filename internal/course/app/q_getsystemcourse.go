package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetSystemCoursesHandler struct {
	readModel GetCoursesReadModel
}

func NewGetSystemCoursesHandler(readModel GetCoursesReadModel) *GetSystemCoursesHandler {
	return &GetSystemCoursesHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetCourses, *Paginated[Course]] = (*GetSystemCoursesHandler)(nil)

func (h *GetSystemCoursesHandler) Handle(ctx context.Context, params *GetCourses) (*Paginated[Course], error) {
	return h.readModel.GetCourses(ctx, params)
}
