package domain

import (
	"time"

	"github.com/google/uuid"
)

type VideoLesson struct {
	LessonBase
	VideoURL string
	Duration time.Duration
}

func NewVideoLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	videoURL string,
	duration time.Duration,
) *VideoLesson {
	return &VideoLesson{
		LessonBase: *NewLessonBase(id, sectionID, order),
		VideoURL:   videoURL,
		Duration:   duration,
	}
}

func UnmarshalVideoLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	videoURL string,
	duration time.Duration,
) *VideoLesson {
	return &VideoLesson{
		LessonBase: *UnmarshalLessonBase(id, sectionID, order),
		VideoURL:   videoURL,
		Duration:   duration,
	}
}

func (vl *VideoLesson) GetVideoURL() string {
	return vl.VideoURL
}

func (vl *VideoLesson) SetVideoURL(videoURL string) {
	vl.VideoURL = videoURL
}

func (vl *VideoLesson) GetDuration() time.Duration {
	return vl.Duration
}

func (vl *VideoLesson) SetDuration(duration time.Duration) {
	vl.Duration = duration
}
