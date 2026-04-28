package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeObjectStorageFailToRetrieveUploadURLForVideoLesson Code = "objectStorageFailToRetrieveUploadURLForVideoLesson"
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
