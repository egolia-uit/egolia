package model

import (
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

// TestLesson is the extension table for test-type lessons.
// The base fields (SectionID, Title, SortOrder, LessonType) live in the lessons table.
type TestLesson struct {
	LessonID     uuid.UUID           `gorm:"type:uuid;primaryKey"`
	QuestionType domain.QuestionType `gorm:"column:question_type;type:varchar(50);not null"`
	Questions    []TestQuestion      `gorm:"foreignKey:TestLessonID;references:LessonID"`
}

func (TestLesson) TableName() string { return "test_lessons" }
