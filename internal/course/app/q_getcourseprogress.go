package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type GetCourseProgress struct {
	CourseID uuid.UUID
	UserID   string
}

type GetCourseProgressHandler struct {
	readModel GetCourseProgressReadModel
}

func NewGetCourseProgressHandler(readModel GetCourseProgressReadModel) *GetCourseProgressHandler {
	return &GetCourseProgressHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetCourseProgress, *CourseProgress] = (*GetCourseProgressHandler)(nil)

func (h *GetCourseProgressHandler) Handle(ctx context.Context, query *GetCourseProgress) (*CourseProgress, error) {
	return h.readModel.GetCourseProgress(ctx, query)
}
