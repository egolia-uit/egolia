package model

import (
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type TestQuestion struct {
	ID           uuid.UUID    `gorm:"type:uuid;primaryKey"`
	TestLessonID uuid.UUID    `gorm:"column:test_lesson_id;type:uuid;not null"`
	QuestionText string       `gorm:"column:question_text;type:text;not null"`
	Answers      []TestAnswer `gorm:"foreignKey:QuestionID"`
}

func (TestQuestion) TableName() string { return "test_questions" }

func TestQuestionFromDomain(q *domain.TestQuestion, lessonID uuid.UUID) TestQuestion {
	answers := make([]TestAnswer, 0, len(q.Answers))
	for _, a := range q.Answers {
		answers = append(answers, TestAnswerFromDomain(a, q.ID))
	}
	return TestQuestion{
		ID:           q.ID,
		TestLessonID: lessonID,
		QuestionText: q.Question,
		Answers:      answers,
	}
}

func (m *TestQuestion) ToDomain() *domain.TestQuestion {
	answers := make([]*domain.TestAnswer, 0, len(m.Answers))
	for i := range m.Answers {
		answers = append(answers, m.Answers[i].ToDomain())
	}
	return domain.NewTestQuestion(m.ID, m.QuestionText, answers)
}
