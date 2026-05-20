package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type DeclineCourse struct {
	CourseID uuid.UUID
}

type DeclineCourseHandler struct {
	uow domain.UnitOfWork
}

func NewDeclineCourseHandler(uow domain.UnitOfWork) *DeclineCourseHandler {
	return &DeclineCourseHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[DeclineCourse] = (*DeclineCourseHandler)(nil)

func (h *DeclineCourseHandler) Handle(ctx context.Context, cmd *DeclineCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}
		if course == nil {
			return errs.NewCourseNotFound(cmd.CourseID, err)
		}
		if course.Status() != domain.CourseStatusPending {
			return errs.NewInvalid("only pending course can be declined")
		}

		course.Delete()

		err = repoRegistry.Course().Save(ctx, course)
		if err != nil {
			return err
		}
		return nil
	})
}
