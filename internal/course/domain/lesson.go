package domain

import "github.com/google/uuid"

type Lesson interface {
	isLesson()
	ID() uuid.UUID
	SectionID() uuid.UUID
	Order() string
}

type LessonBase struct {
	id        uuid.UUID
	sectionID uuid.UUID
	order     string
}

var _ Lesson = (*LessonBase)(nil)

func (l *LessonBase) isLesson() {}

func (l *LessonBase) ID() uuid.UUID { return l.id }

func (l *LessonBase) SectionID() uuid.UUID { return l.sectionID }

func (l *LessonBase) Order() string { return l.order }
