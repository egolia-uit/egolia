package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type SaveVideoLessonProgress struct {
	UserID         string
	LessonID       uuid.UUID
	WatchedSeconds float32
	IsCompleted    bool
}

type SaveVideoLessonProgressCmd Cmd[SaveVideoLessonProgress]

type SaveVideoLessonProgressHandler struct {
	uow domain.UnitOfWork
}

func NewSaveVideoLessonProgressHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) SaveVideoLessonProgressCmd {
	handler := &SaveVideoLessonProgressHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[SaveVideoLessonProgress] = (*SaveVideoLessonProgressHandler)(nil)

func (h *SaveVideoLessonProgressHandler) Handle(ctx context.Context, cmd *SaveVideoLessonProgress) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonProgress, err := repoRegistry.LessonProgress().GetByUserAndLesson(ctx, cmd.UserID, cmd.LessonID)
		if err != nil {
			return err
		}
		lessonProgressVideoID := uuid.New()
		if lessonProgress != nil {
			lessonProgressVideoID = lessonProgress.ID()
		}
		progress := domain.NewLessonProgressVideo(
			lessonProgressVideoID,
			cmd.UserID,
			cmd.LessonID,
			cmd.WatchedSeconds,
			cmd.IsCompleted,
		)
		return repoRegistry.LessonProgress().Save(ctx, progress)
	})

}
