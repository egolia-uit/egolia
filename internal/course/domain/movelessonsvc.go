package domain

import (
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"roci.dev/fracdex"
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
	var prevOrder string
	if params.PrevLesson != nil {
		prevOrder = params.PrevLesson.Order()
	}
	var nextOrder string
	if params.NextLesson != nil {
		nextOrder = params.NextLesson.Order()
	}
	order, err := fracdex.KeyBetween(nextOrder, prevOrder)
	if err != nil {
		return errs.NewLessonGenerateOrderFailed(prevOrder, nextOrder, err)
	}
	params.Target.SetOrder(order)
	params.Target.SetSectionID(params.SectionID)
	return nil
}
