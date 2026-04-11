package domain

import (
	"time"

	"github.com/google/uuid"
)

type LessonProgressVideo struct {
	LessonProgressBase
	watchedSeconds *float64
	lastViewedAt   time.Time
}

func NewLessonProgressVideo(
	id uuid.UUID,
	enrollmentID uuid.UUID,
	lessonID uuid.UUID,
	watchedSeconds *float64,
	lastViewedAt time.Time,
) *LessonProgressVideo {
	return &LessonProgressVideo{
		LessonProgressBase: LessonProgressBase{
			id:           id,
			enrollmentID: enrollmentID,
			lessonID:     lessonID,
			isCompleted:  false,
			deletedAt:    nil,
		},
		watchedSeconds: watchedSeconds,
		lastViewedAt:   lastViewedAt,
	}
}

func UnmarshalLessonProgressVideo(
	id uuid.UUID,
	enrollmentID uuid.UUID,
	lessonID uuid.UUID,
	isCompleted bool,
	deletedAt *time.Time,
	watchedSeconds *float64,
	lastViewedAt time.Time,
) *LessonProgressVideo {
	return &LessonProgressVideo{
		LessonProgressBase: LessonProgressBase{
			id:           id,
			enrollmentID: enrollmentID,
			lessonID:     lessonID,
			isCompleted:  isCompleted,
			deletedAt:    deletedAt,
		},
		watchedSeconds: watchedSeconds,
		lastViewedAt:   lastViewedAt,
	}
}

func (lpv *LessonProgressVideo) WatchedSeconds() *float64 {
	return lpv.watchedSeconds
}

func (lpv *LessonProgressVideo) SetWatchedSeconds(seconds float64) {
	lpv.watchedSeconds = &seconds
}

func (lpv *LessonProgressVideo) LastViewedAt() time.Time {
	return lpv.lastViewedAt
}

func (lpv *LessonProgressVideo) SetLastViewedAt(lastViewedAt time.Time) {
	lpv.lastViewedAt = lastViewedAt
}
