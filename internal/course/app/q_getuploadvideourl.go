package app

import (
	"context"
	"log/slog"
)

type GetUploadVideoLessonURL struct {
	VideoFilename string
}

type GetUploadVideoLessonURLQuery Query[GetUploadVideoLessonURL, *VideoLessonObject]

type GetUploadVideoLessonURLHandler struct {
	objectStorageSvc ObjectStorageSvc
}

func NewGetUploadVideoLessonURLHandler(objectStorageSvc ObjectStorageSvc, logger *slog.Logger, tracer Tracer) GetUploadVideoLessonURLQuery {
	handler := &GetUploadVideoLessonURLHandler{objectStorageSvc: objectStorageSvc}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

func (h *GetUploadVideoLessonURLHandler) Handle(ctx context.Context, cmd *GetUploadVideoLessonURL) (*VideoLessonObject, error) {
	return h.objectStorageSvc.GetUploadVideoLessonURL(ctx, &GetUploadVideoLessonURLParams{
		VideoFilename: cmd.VideoFilename,
	})
}
