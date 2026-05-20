package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetCourseDetail struct {
	CourseID  uuid.UUID
	UserID    string
	UserRoles []UserRole
}

type GetCourseDetailHandler struct {
	getCourseDetailReadModel GetCourseDetailReadModel
	authorizationSvc         *domain.AuthorizationSvc
}

func NewGetCourseDetailHandler(getCourseDetailReadModel GetCourseDetailReadModel, authorizationSvc *domain.AuthorizationSvc) *GetCourseDetailHandler {
	return &GetCourseDetailHandler{
		getCourseDetailReadModel: getCourseDetailReadModel,
		authorizationSvc:         authorizationSvc,
	}
}

var _ commonhandler.Query[GetCourseDetail, *CourseDetail] = (*GetCourseDetailHandler)(nil)

func (h *GetCourseDetailHandler) Handle(ctx context.Context, query *GetCourseDetail) (*CourseDetail, error) {
	roles := make([]string, len(query.UserRoles))
	for i, role := range query.UserRoles {
		roles[i] = string(role)
	}
	hasPermission, err := h.authorizationSvc.HasGetCourseDetailPermission(ctx, query.CourseID, query.UserID, roles)
	if err != nil {
		return nil, err
	}
	if !hasPermission {
		return nil, errs.Unauthorized
	}
	deleted := false
	return h.getCourseDetailReadModel.GetCourseDetail(ctx, query.CourseID, &deleted)
}
