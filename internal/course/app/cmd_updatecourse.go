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

type UpdateCourse struct {
	CourseID     uuid.UUID
	Title        string
	Price        int64
	Overview     string
	Introduction CourseLandingPageIntroduction
}

type UpdateCourseCmd Cmd[UpdateCourse]

type UpdateCourseHandler struct {
	updateCourseSvc *domain.UpdateCourseSvc
	uow             domain.UnitOfWork
}

func NewUpdateCourseHandler(updateCourseSvc *domain.UpdateCourseSvc, uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) UpdateCourseCmd {
	handler := &UpdateCourseHandler{
		updateCourseSvc: updateCourseSvc,
		uow:             uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[UpdateCourse] = (*UpdateCourseHandler)(nil)

func (h *UpdateCourseHandler) Handle(ctx context.Context, cmd *UpdateCourse) error {
	if h.uow == nil {
		return errs.NewInternal("unit of work is required")
	}

	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}

		if err := h.updateCourseSvc.Handle(&domain.UpdateCourse{
			Course:       course,
			Title:        cmd.Title,
			Price:        float64(cmd.Price),
			Overview:     cmd.Overview,
			Introduction: domain.NewCourseLandingPageIntroduction(cmd.Introduction.VideoUrl),
		}); err != nil {
			return err
		}

		return repoRegistry.Course().Save(ctx, course)
	})
}
