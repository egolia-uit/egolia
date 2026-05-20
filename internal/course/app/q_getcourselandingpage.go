package app

import (
	"context"

	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetCourseLandingPage struct {
	CourseID uuid.UUID
	Status   *CourseStatus
	Hidden   *bool
}

type GetCourseLandingPageHandler struct {
	readModel GetCoursesReadModel
}

func NewGetCourseLandingPageHandler(readModel GetCoursesReadModel) *GetCourseLandingPageHandler {
	return &GetCourseLandingPageHandler{readModel: readModel}
}

var _ commonhandler.Query[GetCourseLandingPage, *Course] = (*GetCourseLandingPageHandler)(nil)

func (h *GetCourseLandingPageHandler) Handle(ctx context.Context, query *GetCourseLandingPage) (*Course, error) {
	hidden := false
	status := CourseStatusApproved
	return h.readModel.GetCourseByID(ctx, &GetCourseLandingPage{
		CourseID: query.CourseID,
		Status:   &status,
		Hidden:   &hidden,
	})
}
