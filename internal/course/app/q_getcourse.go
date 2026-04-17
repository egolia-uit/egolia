package app

import "context"

type GetCourse struct {
	CourseID string
}

type GetCourseReadModel interface {
	GetCourse(ctx context.Context, courseID string) (*Course, error)
}

type GetCourseHandler struct {
	readModel GetCourseReadModel
}

func NewGetCourseHandler(readModel GetCourseReadModel) *GetCourseHandler {
	return &GetCourseHandler{readModel: readModel}
}

func (h *GetCourseHandler) Handle(ctx context.Context, query GetCourse) (*Course, error) {
	return h.readModel.GetCourse(ctx, query.CourseID)
}
