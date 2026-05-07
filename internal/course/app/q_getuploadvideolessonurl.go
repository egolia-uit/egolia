package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetUploadVideoLessonURL struct {
	LessonID      uuid.UUID
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

var _ Query[GetUploadVideoLessonURL, *VideoLessonObject] = (*GetUploadVideoLessonURLHandler)(nil)

func (h *GetUploadVideoLessonURLHandler) Handle(ctx context.Context, cmd *GetUploadVideoLessonURL) (*VideoLessonObject, error) {
	return h.objectStorageSvc.GetUploadVideoLessonURL(ctx, &GetUploadVideoLessonURLParams{
		LessonID:      cmd.LessonID,
		VideoFilename: cmd.VideoFilename,
	})
}
