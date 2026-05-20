package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type SubmitCourse struct {
	CourseID uuid.UUID
	ActorID  string
}

type SubmitCourseHandler struct {
	uow domain.UnitOfWork
}

func NewSubmitCourseHandler(uow domain.UnitOfWork) *SubmitCourseHandler {
	return &SubmitCourseHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[SubmitCourse] = (*SubmitCourseHandler)(nil)

func (h *SubmitCourseHandler) Handle(ctx context.Context, cmd *SubmitCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}
		if course.Status() != domain.CourseStatusDraft {
			return errs.NewCourseInvalid("Status", "Course must be in draft status to be submitted")
		}
		course.SetStatus(domain.CourseStatusPending)

		return repoRegistry.Course().Save(ctx, course)
	})
}
