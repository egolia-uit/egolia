package app

import (
	"context"
)

type GetUploadVideoLessonURL struct {
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
		VideoFilename: cmd.VideoFilename,
	})
}
