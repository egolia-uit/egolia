package domain

import "github.com/google/uuid"

type TestLessonType string

const (
	MultipleChoice TestLessonType = "multipleChoice"
	SingleChoice   TestLessonType = "singleChoice"
)

type TestAnswer struct {
	ID        uuid.UUID
	Content   string
	IsCorrect bool
}

type TestQuestion struct {
	ID       uuid.UUID
	Question string
	Anwsers  []*TestAnswer
}

type TestLesson struct {
	LessonBase
	Type      TestLessonType
	Questions []*TestQuestion
}
