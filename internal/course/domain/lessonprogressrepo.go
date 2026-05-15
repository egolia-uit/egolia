package domain

import (
	"context"

	"github.com/google/uuid"
)

type LessonProgressRepo interface {
	Save(ctx context.Context, progress LessonProgress) error
	GetByUserIDAndLesson(ctx context.Context, userID string, lessonID uuid.UUID) (LessonProgress, error)
}
