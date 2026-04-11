package domain

type MoveLessonSvc struct{}

func NewMoveLessonSvc() *MoveLessonSvc {
	return &MoveLessonSvc{}
}

type MoveLesson struct {
	PreviousLesson *Lesson
	NextLesson     *Lesson
	Target         *Lesson
}

func (s *MoveLessonSvc) Handle(params *MoveLesson) {
}
