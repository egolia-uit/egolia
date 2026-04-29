package model

import (
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type TestAnswer struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	QuestionID uuid.UUID `gorm:"type:uuid;not null"`
	Answer     string    `gorm:"type:text;not null"`
	IsCorrect  bool      `gorm:"default:false"`
}

func (TestAnswer) TableName() string { return "test_answers" }

func TestAnswerFromDomain(a *domain.TestAnswer, questionID uuid.UUID) TestAnswer {
	return TestAnswer{
		ID:         a.ID,
		QuestionID: questionID,
		Answer:     a.Content,
		IsCorrect:  a.IsCorrect,
	}
}

func (m *TestAnswer) ToDomain() *domain.TestAnswer {
	return domain.NewTestAnswer(m.ID, m.Answer, m.IsCorrect)
}
