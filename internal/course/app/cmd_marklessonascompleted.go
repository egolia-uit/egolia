package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type MarkLessonAsCompleted struct {
	UserID   string
	CourseID uuid.UUID
	LessonID uuid.UUID
}

type MarkLessonAsCompletedHandler struct {
	uow domain.UnitOfWork
}

func NewMarkLessonAsCompletedHandler(uow domain.UnitOfWork) *MarkLessonAsCompletedHandler {
	return &MarkLessonAsCompletedHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[MarkLessonAsCompleted] = (*MarkLessonAsCompletedHandler)(nil)

func (h *MarkLessonAsCompletedHandler) Handle(ctx context.Context, cmd *MarkLessonAsCompleted) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}
		if course == nil {
			return nil
		}
		lessonProgress, err := repoRegistry.LessonProgress().GetByUserIDAndLesson(ctx, cmd.UserID, cmd.LessonID)
		if err != nil {
			return err
		}
		if lessonProgress == nil {
			return nil
		}
		if lessonProgress.IsCompleted() {
			return nil
		}
		if v, ok := lessonProgress.(*domain.LessonProgressVideo); ok {
			lesson := course.GetLesson(cmd.LessonID)
			if lesson == nil {
				return nil
			}

			videoLesson, ok := lesson.(*domain.VideoLesson)
			if !ok {
				return nil
			}

			if v.WatchedSeconds() == nil || *v.WatchedSeconds() < 0.8*videoLesson.GetDuration().Seconds() {
				return nil
			}
		}
		lessonProgress.MarkAsCompleted()
		return repoRegistry.LessonProgress().Save(ctx, lessonProgress)
	})
}
