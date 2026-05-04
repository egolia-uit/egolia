package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FinishCourse struct {
	CourseID uuid.UUID
	ActorID  string
}

type FinishCourseHandler struct {
	finishCourseSvc *domain.FinishCourseSvc
	uow             domain.UnitOfWork
}

func NewFinishCourseHandler(finishCourseSvc *domain.FinishCourseSvc, uow domain.UnitOfWork) *FinishCourseHandler {
	return &FinishCourseHandler{
		finishCourseSvc: finishCourseSvc,
		uow:             uow,
	}
}

func (h *FinishCourseHandler) Handle(ctx context.Context, cmd *FinishCourse) error {
	if h.uow == nil {
		return errs.NewInternal("unit of work is required")
	}

	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		enrollment, err := repoRegistry.Enrollment().GetByCourseAndLearner(ctx, domain.EnrollmentRepoGetByCourseAndLearner{
			CourseID:  cmd.CourseID,
			LearnerID: cmd.ActorID,
		}, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewInvalid("enrollment not found")
			}
			return err
		}

		if err := h.finishCourseSvc.Handle(&domain.FinishCourse{
			Enrollment: enrollment,
			LearnerID:  cmd.ActorID,
		}); err != nil {
			return err
		}

		return repoRegistry.Enrollment().Save(ctx, enrollment)
	})
}
