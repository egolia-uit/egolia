package app

import (
	"context"
	"errors"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HideCourse struct {
	CourseID uuid.UUID
	UserID   string
	Roles    []UserRole
}

type HideCourseCmd Cmd[HideCourse]

type HideCourseHandler struct {
	authorizationSvc *domain.AuthorizationSvc
	uow              domain.UnitOfWork
}

func NewHideCourseHandler(
	authorizationSvc *domain.AuthorizationSvc,
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) HideCourseCmd {
	handler := &HideCourseHandler{
		authorizationSvc: authorizationSvc,
		uow:              uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[HideCourse] = (*HideCourseHandler)(nil)

func (h *HideCourseHandler) Handle(ctx context.Context, command *HideCourse) error {
	roles := make([]string, len(command.Roles))
	for i, role := range command.Roles {
		roles[i] = string(role)
	}

	hasPermission, err := h.authorizationSvc.HasHideCoursePermission(ctx, command.CourseID, command.UserID, roles)
	if err != nil {
		return err
	}
	if !hasPermission {
		return errs.Unauthorized
	}

	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, command.CourseID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(command.CourseID, err)
			}
			return err
		}

		course.ToggleHidden()
		return repoRegistry.Course().Save(ctx, course)
	})
}
