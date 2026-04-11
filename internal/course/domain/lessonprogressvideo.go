package domain

import "time"

type LessonProgressVideo struct {
	LessonProgressBase
	watchedSeconds *float64
	lastViewedAt   time.Time
}
