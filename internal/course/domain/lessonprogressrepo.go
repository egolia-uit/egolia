package domain

import (
	"context"

	"github.com/google/uuid"
)

type LessonProgressRepo interface {
	Save(ctx context.Context, progress LessonProgress) error
	GetByEnrollmentAndLesson(ctx context.Context, enrollmentID uuid.UUID, lessonID uuid.UUID) (LessonProgress, error)
}
