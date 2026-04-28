package app

import (
	"context"

	"github.com/google/uuid"
)

type GetUploadVideoLessonURLParams struct {
	LessonID      uuid.UUID
	VideoFilename string
}

type ObjectStorageSvc interface {
	GetUploadVideoLessonURL(ctx context.Context, params *GetUploadVideoLessonURLParams) (*VideoLessonObject, error)
}
