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

func NewTestAnswer(
	id uuid.UUID,
	content string,
	isCorrect bool,
) *TestAnswer {
	return &TestAnswer{
		ID:        id,
		Content:   content,
		IsCorrect: isCorrect,
	}
}

type TestQuestion struct {
	ID       uuid.UUID
	Question string
	Anwsers  []*TestAnswer
}

func NewTestQuestion(
	id uuid.UUID,
	question string,
	answers []*TestAnswer,
) *TestQuestion {
	return &TestQuestion{
		ID:       id,
		Question: question,
		Anwsers:  answers,
	}
}

type TestLesson struct {
	LessonBase
	Type      TestLessonType
	Questions []*TestQuestion
}

func NewTestLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	lessonType TestLessonType,
	questions []*TestQuestion,
) *TestLesson {
	return &TestLesson{
		LessonBase: *NewLessonBase(id, sectionID, order),
		Type:       lessonType,
		Questions:  questions,
	}
}

func UnmarshalTestLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	lessonType TestLessonType,
	questions []*TestQuestion,
) *TestLesson {
	return &TestLesson{
		LessonBase: *UnmarshalLessonBase(id, sectionID, order),
		Type:       lessonType,
		Questions:  questions,
	}
}

func (tl *TestLesson) LessonType() TestLessonType {
	return tl.Type
}

func (tl *TestLesson) GetQuestions() []*TestQuestion {
	return tl.Questions
}

func (tl *TestLesson) SetQuestions(questions []*TestQuestion) {
	tl.Questions = questions
}
