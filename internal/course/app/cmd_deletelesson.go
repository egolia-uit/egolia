package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type DeleteLesson struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	LessonID  uuid.UUID
	UserID    string
}

type DeleteLessonHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteLessonHandler(uow domain.UnitOfWork) *DeleteLessonHandler {
	return &DeleteLessonHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[DeleteLesson] = (*DeleteLessonHandler)(nil)

func (h *DeleteLessonHandler) Handle(ctx context.Context, cmd *DeleteLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		course.DeleteLesson(cmd.SectionID, cmd.LessonID)

		return repoRegistry.Course().Save(ctx, course)
	})
}
