package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetCourse struct {
	CourseID string
}

type GetCourseHandler struct {
	readModel GetCourseReadModel
}

func NewGetCourseHandler(readModel GetCourseReadModel) *GetCourseHandler {
	return &GetCourseHandler{readModel: readModel}
}

var _ commonhandler.Query[GetCourse, *Course] = (*GetCourseHandler)(nil)

func (h *GetCourseHandler) Handle(ctx context.Context, query *GetCourse) (*Course, error) {
	panic("GetCourseHandler.Handle is not implemented yet")
}
