package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type ApproveCourse struct {
	CourseID uuid.UUID
}

type ApproveCourseHandler struct {
	uow            domain.UnitOfWork
	eventPublisher EventPublisher
}

func NewApproveCourseHandler(uow domain.UnitOfWork, eventPublisher EventPublisher) *ApproveCourseHandler {
	return &ApproveCourseHandler{
		uow:            uow,
		eventPublisher: eventPublisher,
	}
}

var _ commonhandler.Cmd[ApproveCourse] = (*ApproveCourseHandler)(nil)

func (h *ApproveCourseHandler) Handle(ctx context.Context, cmd *ApproveCourse) error {
	var events []domain.DomainEvent

	err := h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}

		if course.OriginalCourseID() == nil {
			course.Approve()
			if err := repoRegistry.Course().Save(ctx, course); err != nil {
				return err
			}
		} else {
			publishedCourseID := *course.OriginalCourseID()
			originalCourse, err := repoRegistry.Course().GetFull(ctx, publishedCourseID)
			if err != nil {
				return err
			}

			events, err = originalCourse.Merge(course)
			if err != nil {
				return err
			}
			originalCourse.Approve()

			course.Delete()

			if err := repoRegistry.Course().Save(ctx, originalCourse); err != nil {
				return err
			}
			if err := repoRegistry.Course().Save(ctx, course); err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return err
	}

	if len(events) > 0 {
		return h.eventPublisher.Publish(ctx, events...)
	}

	return nil
}
