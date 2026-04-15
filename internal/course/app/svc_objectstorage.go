package app

import "github.com/google/uuid"

type ObjectStorageSvc interface {
	GetUploadVideoLessonURL(lessonID uuid.UUID) (*VideoLessonObject, error)
}
