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
	// TODO: ここでDBから対象のレッスンを取得して、順番を入れ替える
	return nil
}
