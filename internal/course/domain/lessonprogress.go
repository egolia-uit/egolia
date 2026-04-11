package domain

import (
	"time"

	"github.com/google/uuid"
)

type LessonProgress interface {
	isLessonProgress()
	ID() uuid.UUID
	EnrollmentID() uuid.UUID
	LessonID() uuid.UUID
	IsCompleted() bool
	DeletedAt() *time.Time
}

type LessonProgressBase struct {
	id           uuid.UUID
	enrollmentID uuid.UUID
	lessonID     uuid.UUID
	isCompleted  bool
	deletedAt    *time.Time
}

var _ LessonProgress = (*LessonProgressBase)(nil)

func NewLessonProgressBase(
	id uuid.UUID,
	enrollmentID uuid.UUID,
	lessonID uuid.UUID,
) *LessonProgressBase {
	return &LessonProgressBase{
		id:           id,
		enrollmentID: enrollmentID,
		lessonID:     lessonID,
		isCompleted:  false,
		deletedAt:    nil,
	}
}

func UnmarshalLessonProgressBase(
	id uuid.UUID,
	enrollmentID uuid.UUID,
	lessonID uuid.UUID,
	isCompleted bool,
	deletedAt *time.Time,
) *LessonProgressBase {
	return &LessonProgressBase{
		id:           id,
		enrollmentID: enrollmentID,
		lessonID:     lessonID,
		isCompleted:  isCompleted,
		deletedAt:    deletedAt,
	}
}

func (l *LessonProgressBase) isLessonProgress() {}

func (l *LessonProgressBase) ID() uuid.UUID { return l.id }

func (l *LessonProgressBase) EnrollmentID() uuid.UUID { return l.enrollmentID }

func (l *LessonProgressBase) LessonID() uuid.UUID { return l.lessonID }

func (l *LessonProgressBase) IsCompleted() bool { return l.isCompleted }

func (l *LessonProgressBase) DeletedAt() *time.Time { return l.deletedAt }

func (l *LessonProgressBase) Complete() {
	l.isCompleted = true
}

func (l *LessonProgressBase) Delete() {
	l.deletedAt = new(time.Time)
	*l.deletedAt = time.Now()
}
