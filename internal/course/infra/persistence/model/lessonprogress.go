package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type LessonProgress struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey"`
	EnrollmentID uuid.UUID  `gorm:"type:uuid;not null"`
	LessonID     uuid.UUID  `gorm:"type:uuid;not null"`
	IsCompleted  bool       `gorm:"not null;default:false"`
	DeletedAt    *time.Time `gorm:"index"`
	CreatedAt    time.Time  `gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime"`
}

func (LessonProgress) TableName() string { return "lesson_progresses" }

func LessonProgressFromDomain(p domain.LessonProgress) *LessonProgress {
	return &LessonProgress{
		ID:           p.ID(),
		EnrollmentID: p.EnrollmentID(),
		LessonID:     p.LessonID(),
		IsCompleted:  p.IsCompleted(),
		DeletedAt:    p.DeletedAt(),
		CreatedAt:    time.Time{},
		UpdatedAt:    time.Time{},
	}
}

func (m *LessonProgress) ToDomain() *domain.LessonProgressBase {
	return domain.UnmarshalLessonProgressBase(m.ID, m.EnrollmentID, m.LessonID, m.IsCompleted, m.DeletedAt)
}
