package app

import "context"

type GetCourseDetail struct {
	CourseID string
}

type GetCourseDetailReadModel interface {
	GetCourseDetail(ctx context.Context, courseID string) (*CourseDetail, error)
}

type GetCourseDetailHandler struct {
	readModel GetCourseDetailReadModel
}

func NewGetCourseDetailHandler(readModel GetCourseDetailReadModel) *GetCourseDetailHandler {
	return &GetCourseDetailHandler{readModel: readModel}
}

func (h *GetCourseDetailHandler) Handle(ctx context.Context, query GetCourseDetail) (*CourseDetail, error) {
	return h.readModel.GetCourseDetail(ctx, query.CourseID)
}
