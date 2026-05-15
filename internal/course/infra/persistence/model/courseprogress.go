package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type CourseProgress struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	CourseID  uuid.UUID `gorm:"type:uuid;not null"`
	UserID    string    `gorm:"type:text;not null"`
	Progress  float64   `gorm:"not null;default:0"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (CourseProgress) TableName() string { return "course_progresses" }

func CourseProgressFromDomain(p *domain.CourseProgress) *CourseProgress {
	return &CourseProgress{
		ID:        p.ID,
		CourseID:  p.CourseID,
		UserID:    p.UserID,
		Progress:  p.Progress,
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
	}
}

func (m *CourseProgress) ToDomain() *domain.CourseProgress {
	return &domain.CourseProgress{
		ID:       m.ID,
		CourseID: m.CourseID,
		UserID:   m.UserID,
		Progress: m.Progress,
	}
}
