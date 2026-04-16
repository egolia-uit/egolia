package app

import (
	"context"

	"github.com/google/uuid"
)

type ObjectStorageSvc interface {
	GetUploadVideoLessonURL(ctx context.Context, lessonID uuid.UUID) (*VideoLessonObject, error)
}
