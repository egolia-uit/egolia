package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Lesson struct {
	ID               uuid.UUID         `gorm:"type:uuid;primaryKey"`
	SectionID        uuid.UUID         `gorm:"type:uuid;not null"`
	OriginalLessonID *uuid.UUID        `gorm:"type:uuid;column:original_lesson_id"`
	Title            string            `gorm:"type:varchar(255);not null"`
	Index            int               `gorm:"column:index;type:integer;not null;default:0"`
	LessonType       domain.LessonType `gorm:"column:lesson_type;type:varchar(50);not null"`
	VideoLesson      *VideoLesson      `gorm:"foreignKey:LessonID"`
	TestLesson       *TestLesson       `gorm:"foreignKey:LessonID"`
	DeletedAt        gorm.DeletedAt    `gorm:"index"`
	CreatedAt        time.Time         `gorm:"autoCreateTime"`
	UpdatedAt        time.Time         `gorm:"autoUpdateTime"`
}

func (Lesson) TableName() string { return "lessons" }

func LessonFromDomain(index int, l domain.Lesson, sectionID uuid.UUID) *Lesson {
	var deletedAt gorm.DeletedAt
	if l.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *l.DeletedAt(), Valid: true}
	}

	switch lesson := l.(type) {
	case *domain.VideoLesson:
		return &Lesson{
			ID:               l.ID(),
			SectionID:        sectionID,
			OriginalLessonID: lesson.OriginalLessonID(),
			Title:            l.Title(),
			Index:            index,
			LessonType:       domain.LessonTypeVideo,
			VideoLesson: &VideoLesson{
				LessonID: l.ID(),
				VideoKey: lesson.GetVideoKey(),
				Duration: int64(lesson.GetDuration() / time.Second),
			},
			TestLesson: nil,
			DeletedAt:  deletedAt,
			CreatedAt:  time.Time{},
			UpdatedAt:  time.Time{},
		}
	case *domain.TestLesson:
		questions := make([]TestQuestion, 0, len(lesson.GetQuestions()))
		for _, q := range lesson.GetQuestions() {
			questions = append(questions, TestQuestionFromDomain(q, l.ID()))
		}
		return &Lesson{
			ID:               l.ID(),
			SectionID:        sectionID,
			OriginalLessonID: lesson.OriginalLessonID(),
			Title:            l.Title(),
			Index:            index,
			LessonType:       domain.LessonTypeTest,
			VideoLesson:      nil,
			TestLesson: &TestLesson{
				LessonID:     l.ID(),
				QuestionType: lesson.QuestionType(),
				Questions:    questions,
			},
			DeletedAt: deletedAt,
			CreatedAt: time.Time{},
			UpdatedAt: time.Time{},
		}
	}
	return nil
}

func (m *Lesson) ToDomain() domain.Lesson {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	switch m.LessonType {
	case domain.LessonTypeVideo:
		if m.VideoLesson == nil {
			return nil
		}
		l := domain.UnmarshalVideoLesson(
			m.ID,
			m.Title,
			m.VideoLesson.VideoKey,
			time.Duration(m.VideoLesson.Duration)*time.Second,
		)
		l.SetOriginalLessonID(m.OriginalLessonID)
		l.SetDeletedAt(deletedAt)
		return l
	case domain.LessonTypeTest:
		if m.TestLesson == nil {
			return nil
		}
		questions := make([]*domain.TestQuestion, 0, len(m.TestLesson.Questions))
		for i := range m.TestLesson.Questions {
			questions = append(questions, m.TestLesson.Questions[i].ToDomain())
		}
		l := domain.UnmarshalTestLesson(
			m.ID,
			m.Title,
			m.TestLesson.QuestionType,
			questions,
		)
		l.SetOriginalLessonID(m.OriginalLessonID)
		l.SetDeletedAt(deletedAt)
		return l
	}
	return nil
}
