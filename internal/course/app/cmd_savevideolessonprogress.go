package app

import (
	"context"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type SaveVideoLessonProgress struct {
	UserID         string
	LessonID       uuid.UUID
	EnrollmentID   uuid.UUID
	WatchedSeconds *float64
	LastViewedAt   time.Time
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
		lessonProgress, err := repoRegistry.LessonProgress().GetByEnrollmentAndLesson(ctx, cmd.EnrollmentID, cmd.LessonID)
		if err != nil {
			return err
		}
		videoLessonProgressID := uuid.New()
		if lessonProgress != nil {
			videoLessonProgressID = lessonProgress.ID()
		}
		watchSeconds := float64(10)
		if cmd.WatchedSeconds != nil {
			watchSeconds = *cmd.WatchedSeconds + 10
		}

		progress := domain.NewLessonProgressVideo(
			videoLessonProgressID,
			cmd.EnrollmentID,
			cmd.LessonID,
			&watchSeconds,
			cmd.LastViewedAt,
		)
		return repoRegistry.LessonProgress().Save(ctx, progress)
	})

}
