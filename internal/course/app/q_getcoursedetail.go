package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type GetCourseDetail struct {
	CourseID  uuid.UUID
	UserID    string
	UserRoles []UserRole
}

type GetCourseDetailQuery Query[GetCourseDetail, *CourseDetail]

type GetCourseDetailHandler struct {
	getCourseDetailReadModel GetCourseDetailReadModel
	authorizationSvc         *domain.AuthorizationSvc
}

func NewGetCourseDetailHandler(getCourseDetailReadModel GetCourseDetailReadModel, authorizationSvc *domain.AuthorizationSvc, logger *slog.Logger, tracer Tracer) GetCourseDetailQuery {
	handler := &GetCourseDetailHandler{
		getCourseDetailReadModel: getCourseDetailReadModel,
		authorizationSvc:         authorizationSvc,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourseDetail, *CourseDetail] = (*GetCourseDetailHandler)(nil)

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
	return h.getCourseDetailReadModel.GetCourseDetail(ctx, query.CourseID)
}
