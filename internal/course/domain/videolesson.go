package domain

import "time"

type VideoLesson struct {
	LessonBase
	VideoURL string
	Duration time.Duration
}
