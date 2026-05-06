package model

import (
	"strconv"
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Lesson struct {
	ID          uuid.UUID         `gorm:"type:uuid;primaryKey"`
	SectionID   uuid.UUID         `gorm:"type:uuid;not null"`
	Title       string            `gorm:"type:varchar(255);not null"`
	SortOrder   int               `gorm:"column:sort_order;type:integer;not null;default:0"`
	LessonType  domain.LessonType `gorm:"column:lesson_type;type:varchar(50);not null"`
	VideoLesson *VideoLesson      `gorm:"foreignKey:LessonID"`
	TestLesson  *TestLesson       `gorm:"foreignKey:LessonID"`
	DeletedAt   gorm.DeletedAt    `gorm:"index"`
	CreatedAt   time.Time         `gorm:"autoCreateTime"`
	UpdatedAt   time.Time         `gorm:"autoUpdateTime"`
}

func (Lesson) TableName() string { return "lessons" }

func LessonFromDomain(l domain.Lesson, sectionID uuid.UUID) *Lesson {
	switch lesson := l.(type) {
	case *domain.VideoLesson:
		return &Lesson{
			ID:         l.ID(),
			SectionID:  sectionID,
			Title:      l.Title(),
			SortOrder:  func() int { n, _ := strconv.Atoi(l.Order()); return n }(),
			LessonType: domain.LessonTypeVideo,
			VideoLesson: &VideoLesson{
				LessonID: l.ID(),
				VideoKey: lesson.GetVideoKey(),
				Duration: int64(lesson.GetDuration() / time.Second),
			},
			TestLesson: nil,
			DeletedAt:  gorm.DeletedAt{},
			CreatedAt:  time.Time{},
			UpdatedAt:  time.Time{},
		}
	case *domain.TestLesson:
		questions := make([]TestQuestion, 0, len(lesson.GetQuestions()))
		for _, q := range lesson.GetQuestions() {
			questions = append(questions, TestQuestionFromDomain(q, l.ID()))
		}
		return &Lesson{
			ID:          l.ID(),
			SectionID:   sectionID,
			Title:       l.Title(),
			SortOrder:   func() int { n, _ := strconv.Atoi(l.Order()); return n }(),
			LessonType:  domain.LessonTypeTest,
			VideoLesson: nil,
			TestLesson: &TestLesson{
				LessonID:  l.ID(),
				Type:      lesson.LessonType(),
				Questions: questions,
			},
			DeletedAt: gorm.DeletedAt{},
			CreatedAt: time.Time{},
			UpdatedAt: time.Time{},
		}
	}
	return nil
}

func (m *Lesson) ToDomain() domain.Lesson {
	switch m.LessonType {
	case domain.LessonTypeVideo:
		if m.VideoLesson == nil {
			return nil
		}
		return domain.UnmarshalVideoLesson(
			m.ID,
			strconv.Itoa(m.SortOrder),
			m.Title,
			m.VideoLesson.VideoKey,
			time.Duration(m.VideoLesson.Duration)*time.Second,
		)
	case domain.LessonTypeTest:
		if m.TestLesson == nil {
			return nil
		}
		questions := make([]*domain.TestQuestion, 0, len(m.TestLesson.Questions))
		for i := range m.TestLesson.Questions {
			questions = append(questions, m.TestLesson.Questions[i].ToDomain())
		}
		return domain.UnmarshalTestLesson(
			m.ID,
			strconv.Itoa(m.SortOrder),
			m.Title,
			m.TestLesson.Type,
			questions,
		)
	}
	return nil
}
