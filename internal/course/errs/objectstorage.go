package errs

import (
	"fmt"
)

const (
	CodeObjectStorageFailToRetrieveUploadURLForVideoLesson   Code = "objectStorageFailToRetrieveUploadURLForVideoLesson"
	CodeObjectStorageFailToRetrieveDownloadURLForVideoLesson Code = "objectStorageFailToRetrieveDownloadURLForVideoLesson"
)

type ObjectStorageFailToRetrieveUploadURLForVideoLesson struct {
	VideoFilename string
	Err
}

func NewObjectStorageFailToRetrieveUploadURLForVideoLesson(videoFilename string, err error) *ObjectStorageFailToRetrieveUploadURLForVideoLesson {
	return &ObjectStorageFailToRetrieveUploadURLForVideoLesson{
		VideoFilename: videoFilename,
		Err: Err{
			message: fmt.Sprintf("failed to retrieve upload URL for video lesson with filename %s", videoFilename),
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
