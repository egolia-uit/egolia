package app

import "context"

type GetCourseMetadata struct {
	CourseID string
}

type GetCourseMetadataReadModel interface {
	GetCourseMetadata(ctx context.Context, courseID string) (*Course, error)
}

type GetCourseMetadataHandler struct {
	readModel GetCourseMetadataReadModel
}

func NewGetCourseMetadataHandler(readModel GetCourseMetadataReadModel) *GetCourseMetadataHandler {
	return &GetCourseMetadataHandler{readModel: readModel}
}

func (h *GetCourseMetadataHandler) Handle(ctx context.Context, query GetCourseMetadata) (*Course, error) {
	return h.readModel.GetCourseMetadata(ctx, query.CourseID)
}
