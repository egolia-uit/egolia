package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type GetCourseForUpdate struct {
	CourseID uuid.UUID
	UserID   string
}

type GetCourseForUpdateQuery Query[GetCourseForUpdate, *CourseDetail]

type GetCourseForUpdateHandler struct {
	getCourseDetailReadModel GetCourseDetailReadModel
	authorizationSvc         *domain.AuthorizationSvc
}

func NewGetCourseForUpdateHandler(uow domain.UnitOfWork, getCourseDetailReadModel GetCourseDetailReadModel, logger *slog.Logger, tracer Tracer) GetCourseForUpdateQuery {
	handler := &GetCourseForUpdateHandler{
		getCourseDetailReadModel: getCourseDetailReadModel,
		authorizationSvc:         &domain.AuthorizationSvc{},
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourseForUpdate, *CourseDetail] = (*GetCourseForUpdateHandler)(nil)

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
