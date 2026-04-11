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

func (l *LessonProgressBase) isLessonProgress() {}

func (l *LessonProgressBase) ID() uuid.UUID { return l.id }

func (l *LessonProgressBase) EnrollmentID() uuid.UUID { return l.enrollmentID }

func (l *LessonProgressBase) LessonID() uuid.UUID { return l.lessonID }

func (l *LessonProgressBase) IsCompleted() bool { return l.isCompleted }

func (l *LessonProgressBase) DeletedAt() *time.Time { return l.deletedAt }
