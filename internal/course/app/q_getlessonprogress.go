package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type GetLessonProgress struct {
	UserID   string
	LessonID uuid.UUID
}

type GetLessonProgressQuery Query[GetLessonProgress, LessonProgress]

type GetLessonProgressHandler struct {
	uow domain.UnitOfWork
}

func NewGetLessonProgressHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) GetLessonProgressQuery {
	handler := &GetLessonProgressHandler{
		uow: uow,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetLessonProgress, LessonProgress] = (*GetLessonProgressHandler)(nil)

func (h *GetLessonProgressHandler) Handle(ctx context.Context, query *GetLessonProgress) (LessonProgress, error) {
	var result LessonProgress

	err := h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonProgress, err := repoRegistry.LessonProgress().GetByUserIDAndLesson(ctx, query.UserID, query.LessonID)
		if err != nil {
			return err
		}
		result = toLessonProgressModel(lessonProgress)
		return nil
	})
	return result, err
}

func toLessonProgressModel(lessonProgress domain.LessonProgress) LessonProgress {
	if lessonProgress == nil {
		return nil
	}

	base := LessonProgressBase{
		ID:          lessonProgress.ID(),
		UserID:      lessonProgress.UserID(),
		LessonID:    lessonProgress.LessonID(),
		IsCompleted: lessonProgress.IsCompleted(),
	}

	switch v := lessonProgress.(type) {
	case *domain.LessonProgressVideo:
		return &VideoLessonProgress{
			LessonProgressBase: base,
			WatchedSeconds:     v.WatchedSeconds(),
			LastViewedAt:       v.LastViewedAt(),
		}
	case *domain.LessonProgressTest:
		return &LessonProgressTest{
			LessonProgressBase: base,
		}
	default:
		return &LessonProgressBase{
			ID:          base.ID,
			UserID:      base.UserID,
			LessonID:    base.LessonID,
			IsCompleted: base.IsCompleted,
		}
	}
}
