package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MoveLesson struct {
	CourseID        uuid.UUID
	TargetSectionID uuid.UUID
	LessonID        uuid.UUID
	Order           int
}

type MoveLessonHandler struct {
	uow domain.UnitOfWork
}

func NewMoveLessonHandler(uow domain.UnitOfWork) *MoveLessonHandler {
	return &MoveLessonHandler{
		uow: uow,
	}
}

func (h *MoveLessonHandler) Handle(ctx context.Context, command *MoveLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, command.CourseID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(command.CourseID, err)
			}
			return err
		}
		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}
		course.MoveLesson(command.LessonID, command.TargetSectionID, command.Order)
		return repoRegistry.Course().Save(ctx, course)
	})
}

var _ commonhandler.Cmd[MoveLesson] = (*MoveLessonHandler)(nil)
