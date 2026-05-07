package domain

import (
	"github.com/google/uuid"
)

type MoveLessonSvc struct{}

func NewMoveLessonSvc() *MoveLessonSvc {
	return &MoveLessonSvc{}
}

type MoveLesson struct {
	PrevLesson Lesson
	NextLesson Lesson
	Target     Lesson
	SectionID  uuid.UUID
}

func (s *MoveLessonSvc) Handle(params *MoveLesson) error {
	// TODO: Implement the logic to move the lesson within the section
	panic("not implemented")
}
