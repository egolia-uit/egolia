package domain

import (
	"time"

	"github.com/google/uuid"
)

type LessonProgress interface {
	isLessonProgress()
	ID() uuid.UUID
	LessonID() uuid.UUID
	IsCompleted() bool
	DeletedAt() *time.Time
	UserID() string
	MarkAsCompleted()
}

type LessonProgressBase struct {
	id          uuid.UUID
	userID      string
	lessonID    uuid.UUID
	isCompleted bool
	deletedAt   *time.Time
}

var _ LessonProgress = (*LessonProgressBase)(nil)

func NewLessonProgressBase(
	id uuid.UUID,
	userID string,
	lessonID uuid.UUID,
) *LessonProgressBase {
	return &LessonProgressBase{
		id:          id,
		userID:      userID,
		lessonID:    lessonID,
		isCompleted: false,
		deletedAt:   nil,
	}
}

func UnmarshalLessonProgressBase(
	id uuid.UUID,
	userID string,
	lessonID uuid.UUID,
	isCompleted bool,
	deletedAt *time.Time,
) *LessonProgressBase {
	return &LessonProgressBase{
		id:          id,
		userID:      userID,
		lessonID:    lessonID,
		isCompleted: isCompleted,
		deletedAt:   deletedAt,
	}
}

func (l *LessonProgressBase) isLessonProgress() {}

func (l *LessonProgressBase) ID() uuid.UUID { return l.id }

func (l *LessonProgressBase) UserID() string { return l.userID }

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

func (l *LessonProgressBase) MarkAsCompleted() {
	l.isCompleted = true
}
