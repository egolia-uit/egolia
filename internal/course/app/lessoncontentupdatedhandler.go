package app

import (
	"context"
	"fmt"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type LessonContentUpdatedHandler struct {
	resetLessonProgress ResetLessonProgressCmd
}

func NewLessonContentUpdatedHandler(resetLessonProgress ResetLessonProgressCmd) *LessonContentUpdatedHandler {
	return &LessonContentUpdatedHandler{
		resetLessonProgress: resetLessonProgress,
	}
}

func (h *LessonContentUpdatedHandler) Handle(ctx context.Context, event domain.LessonContentUpdatedEvent) error {
	lessonID, err := uuid.Parse(event.LessonID)
	if err != nil {
		return fmt.Errorf("parse lesson content updated lesson id: %w", err)
	}

	return h.resetLessonProgress.Handle(ctx, &ResetLessonProgress{
		LessonID: lessonID,
	})
}
