package domain

import (
	"time"

	"github.com/google/uuid"
)

type VideoLesson struct {
	LessonBase
	VideoKey string
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
		VideoKey:   videoURL,
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
		VideoKey:   videoURL,
		Duration:   duration,
	}
}

func (vl *VideoLesson) GetVideoKey() string {
	return vl.VideoKey
}

func (vl *VideoLesson) SetVideoKey(videoKey string) {
	vl.VideoKey = videoKey
}

func (vl *VideoLesson) GetDuration() time.Duration {
	return vl.Duration
}

func (vl *VideoLesson) SetDuration(duration time.Duration) {
	vl.Duration = duration
}
