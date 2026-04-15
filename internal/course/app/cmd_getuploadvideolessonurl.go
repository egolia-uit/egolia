package app

import "github.com/google/uuid"

type GetUploadVideoLessonURL struct {
	LessonID uuid.UUID
}

type GetUploadVideoLessonURLHandler struct {
	objectStorageSvc ObjectStorageSvc
}

func NewGetUploadVideoLessonURLHandler(objectStorageSvc ObjectStorageSvc) *GetUploadVideoLessonURLHandler {
	return &GetUploadVideoLessonURLHandler{objectStorageSvc: objectStorageSvc}
}

func (h *GetUploadVideoLessonURLHandler) Handle(cmd GetUploadVideoLessonURL) (*VideoLessonObject, error) {
	return h.objectStorageSvc.GetUploadVideoLessonURL(cmd.LessonID)
}
