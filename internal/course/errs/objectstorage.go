package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeObjectStorageFailToRetrieveUploadURLForVideoLesson   Code = "objectStorageFailToRetrieveUploadURLForVideoLesson"
	CodeObjectStorageFailToRetrieveDownloadURLForVideoLesson Code = "objectStorageFailToRetrieveDownloadURLForVideoLesson"
)

type ObjectStorageFailToRetrieveUploadURLForVideoLesson struct {
	LessonID      uuid.UUID
	VideoFilename string
	Err
}

func NewObjectStorageFailToRetrieveUploadURLForVideoLesson(lessonID uuid.UUID, videoFilename string, err error) *ObjectStorageFailToRetrieveUploadURLForVideoLesson {
	return &ObjectStorageFailToRetrieveUploadURLForVideoLesson{
		LessonID:      lessonID,
		VideoFilename: videoFilename,
		Err: Err{
			message: fmt.Sprintf("failed to retrieve upload URL for video lesson with ID %s", lessonID),
			code:    CodeObjectStorageFailToRetrieveUploadURLForVideoLesson,
			err:     err,
		},
	}
}

type ObjectStorageFailToRetrieveDownloadURLForVideoLesson struct {
	VideoKey string
	Err
}

func NewObjectStorageFailToRetrieveDownloadURLForVideoLesson(videoKey string, err error) *ObjectStorageFailToRetrieveDownloadURLForVideoLesson {
	return &ObjectStorageFailToRetrieveDownloadURLForVideoLesson{
		VideoKey: videoKey,
		Err: Err{
			message: fmt.Sprintf("failed to retrieve download URL for video lesson with key %s", videoKey),
			code:    CodeObjectStorageFailToRetrieveDownloadURLForVideoLesson,
			err:     err,
		},
	}
}
