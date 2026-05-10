package app

import (
	"context"
)

type GetUploadVideoLessonURLParams struct {
	VideoFilename string
}

type ObjectStorageSvc interface {
	GetUploadVideoLessonURL(ctx context.Context, params *GetUploadVideoLessonURLParams) (*VideoLessonObject, error)
	VideoKeyToURL(ctx context.Context, videoKey string) (string, error)
}
