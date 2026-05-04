package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DeleteCourse struct {
	CourseID uuid.UUID
	ActorID  string
}

type DeleteCourseHandler struct {
	deleteCourseSvc *domain.DeleteCourseSvc
	uow             domain.UnitOfWork
}

func NewDeleteCourseHandler(
	deleteCourseSvc *domain.DeleteCourseSvc,
	uow domain.UnitOfWork,
) *DeleteCourseHandler {
	return &DeleteCourseHandler{
		deleteCourseSvc: deleteCourseSvc,
		uow:             uow,
	}
}

func (h *DeleteCourseHandler) Handle(ctx context.Context, cmd *DeleteCourse) error {
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
		if err := h.deleteCourseSvc.Handle(ctx, &domain.DeleteCourse{
			Course:         course,
			EnrollmentRepo: repoRegistry.Enrollment(),
		}); err != nil {
			return err
		}
		// return repoRegistry.Course().Save(ctx, course)
		return nil
	})
}
