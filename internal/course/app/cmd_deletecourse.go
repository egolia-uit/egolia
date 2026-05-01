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
	ActorID  uuid.UUID
	IsAdmin  bool
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
	if h.uow == nil {
		return errs.NewInternal("unit of work is required")
	}
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID:        cmd.CourseID,
			SectionID: uuid.Nil,
			LessonID:  uuid.Nil,
		}, true)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}
		if !cmd.IsAdmin && course.InstructorID() != cmd.ActorID {
			return errs.NewInstructorPermissionDenied(cmd.ActorID, cmd.CourseID)
		}
		if err := h.deleteCourseSvc.Handle(ctx, &domain.DeleteCourse{
			Course:         course,
			EnrollmentRepo: repoRegistry.Enrollment(),
		}); err != nil {
			return err
		}
		return repoRegistry.Course().Save(ctx, course)
	})
}
