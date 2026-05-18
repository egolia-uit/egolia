package app

import (
	"context"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type EditVideoLesson struct {
	CourseID  uuid.UUID
	SectionID uuid.UUID
	LessonID  uuid.UUID
	UserID    string
	Title     *string
	VideoKey  *string
	Duration  *time.Duration
}

type EditVideoLessonCmd Cmd[EditVideoLesson]

type EditVideoLessonHandler struct {
	uow domain.UnitOfWork
}

func NewEditVideoLessonHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) EditVideoLessonCmd {
	handler := &EditVideoLessonHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[EditVideoLesson] = (*EditVideoLessonHandler)(nil)

func (h *EditVideoLessonHandler) Handle(ctx context.Context, cmd *EditVideoLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}
		if err := course.EditVideoLesson(ctx, cmd.SectionID, cmd.LessonID, cmd.UserID, cmd.Title, cmd.VideoKey, cmd.Duration); err != nil {
			return err
			// return nil --- IGNORE ---
			// return repoRegistry.Course().Save(ctx, course) --- IGNORE ---
			// return nil --- IGNORE ---
		}
		return repoRegistry.Course().Save(ctx, course)
	})
}
