package app

import (
	"context"

	"github.com/google/uuid"
)

type GetUploadVideoLessonURL struct {
	LessonID      uuid.UUID
	VideoFilename string
}

type GetUploadVideoLessonURLHandler struct {
	objectStorageSvc ObjectStorageSvc
}

func NewGetUploadVideoLessonURLHandler(objectStorageSvc ObjectStorageSvc) *GetUploadVideoLessonURLHandler {
	return &GetUploadVideoLessonURLHandler{objectStorageSvc: objectStorageSvc}
}

func (h *GetUploadVideoLessonURLHandler) Handle(ctx context.Context, cmd *GetUploadVideoLessonURL) (*VideoLessonObject, error) {
	return h.objectStorageSvc.GetUploadVideoLessonURL(ctx, &GetUploadVideoLessonURLParams{
		LessonID:      cmd.LessonID,
		VideoFilename: cmd.VideoFilename,
	})
}
