package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeObjectStorageFailToRetrieveUploadURLForVideoLesson Code = "objectStorageFailToRetrieveUploadURLForVideoLesson"
)

type ObjectStorageFailToRetrieveUploadURLForVideoLesson struct {
	LessonID uuid.UUID
	Err
}

func NewObjectStorageFailToRetrieveUploadURLForVideoLesson(lessonID uuid.UUID, err error) *ObjectStorageFailToRetrieveUploadURLForVideoLesson {
	return &ObjectStorageFailToRetrieveUploadURLForVideoLesson{
		LessonID: lessonID,
		Err: Err{
			message: fmt.Sprintf("failed to retrieve upload URL for video lesson with ID %s", lessonID),
			code:    CodeObjectStorageFailToRetrieveUploadURLForVideoLesson,
			err:     err,
		},
	}
}
