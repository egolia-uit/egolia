package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EnrollInCourse struct {
	CourseID uuid.UUID
	ActorID  string
}

type EnrollInCourseHandler struct {
	enrollInCourseSvc *domain.EnrollInCourseSvc
	uow               domain.UnitOfWork
}

func NewEnrollInCourseHandler(
	enrollInCourseSvc *domain.EnrollInCourseSvc,
	uow domain.UnitOfWork,
) *EnrollInCourseHandler {
	return &EnrollInCourseHandler{
		enrollInCourseSvc: enrollInCourseSvc,
		uow:               uow,
	}
}

func (h *EnrollInCourseHandler) Handle(ctx context.Context, cmd *EnrollInCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, false)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}

		enrollment, err := h.enrollInCourseSvc.Handle(ctx, &domain.EnrollInCourse{
			Course:    course,
			LearnerID: cmd.ActorID,
		})
		if err != nil {
			return err
		}
		return repoRegistry.Enrollment().Save(ctx, enrollment)
	})
}
