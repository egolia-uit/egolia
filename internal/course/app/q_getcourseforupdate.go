package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetCourseForUpdate struct {
	CourseID uuid.UUID
	UserID   string
}

type GetCourseForUpdateHandler struct {
	getCourseDetailReadModel GetCourseDetailReadModel
	authorizationSvc         *domain.AuthorizationSvc
}

func NewGetCourseForUpdateHandler(uow domain.UnitOfWork, getCourseDetailReadModel GetCourseDetailReadModel) *GetCourseForUpdateHandler {
	return &GetCourseForUpdateHandler{
		getCourseDetailReadModel: getCourseDetailReadModel,
		authorizationSvc:         &domain.AuthorizationSvc{},
	}
}

var _ commonhandler.Query[GetCourseForUpdate, *CourseDetail] = (*GetCourseForUpdateHandler)(nil)

func (h *GetCourseForUpdateHandler) Handle(ctx context.Context, query *GetCourseForUpdate) (*CourseDetail, error) {
	deleted := false
	status := CourseStatusDraft
	courseForUpdate, err := h.getCourseDetailReadModel.GetCourseDetailForUpdate(ctx, query.CourseID, &deleted, &status)
	if err != nil {
		return nil, err
	}
	if courseForUpdate == nil {
		return nil, errs.DraftCourseNotFound
	}
	return courseForUpdate, nil
}
