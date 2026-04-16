package domain

import "github.com/google/uuid"

type Lesson interface {
	isLesson()
	ID() uuid.UUID
	SectionID() uuid.UUID
	SetSectionID(sectionID uuid.UUID)
	Order() string
	SetOrder(order string)
}

type LessonBase struct {
	id        uuid.UUID
	sectionID uuid.UUID
	order     string
}

var _ Lesson = (*LessonBase)(nil)

func NewLessonBase(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
) *LessonBase {
	return &LessonBase{
		id:        id,
		sectionID: sectionID,
		order:     order,
	}
}

func UnmarshalLessonBase(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
) *LessonBase {
	return &LessonBase{
		id:        id,
		sectionID: sectionID,
		order:     order,
	}
}

func (l *LessonBase) isLesson() {}

func (l *LessonBase) ID() uuid.UUID {
	return l.id
}

func (l *LessonBase) SectionID() uuid.UUID {
	return l.sectionID
}

func (l *LessonBase) SetSectionID(sectionID uuid.UUID) {
	l.sectionID = sectionID
}

func (l *LessonBase) Order() string {
	return l.order
}

func (l *LessonBase) SetOrder(order string) {
	l.order = order
}
