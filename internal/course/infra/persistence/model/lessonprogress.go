package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type LessonProgress struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey"`
	// EnrollmentID   uuid.UUID  `gorm:"type:uuid;not null"`
	UserID         string     `gorm:"index;not null"`
	LessonID       uuid.UUID  `gorm:"type:uuid;not null"`
	LessonType     string     `gorm:"column:lesson_type;type:text;not null"`
	IsCompleted    bool       `gorm:"not null;default:false"`
	WatchedSeconds *float64   `gorm:"column:watched_seconds"`
	LastViewedAt   *time.Time `gorm:"column:last_viewed_at"`
	DeletedAt      *time.Time `gorm:"index"`
	CreatedAt      time.Time  `gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime"`
}

func (LessonProgress) TableName() string { return "lesson_progresses" }

func LessonProgressFromDomain(p domain.LessonProgress) *LessonProgress {
	m := &LessonProgress{
		ID:             p.ID(),
		UserID:         p.UserID(),
		LessonID:       p.LessonID(),
		LessonType:     "",
		IsCompleted:    p.IsCompleted(),
		WatchedSeconds: nil,
		LastViewedAt:   nil,
		DeletedAt:      p.DeletedAt(),
		CreatedAt:      time.Time{},
		UpdatedAt:      time.Time{},
	}
	switch v := p.(type) {
	case *domain.LessonProgressVideo:
		m.LessonType = string(domain.LessonTypeVideo)
		m.WatchedSeconds = v.WatchedSeconds()
		lastViewedAt := v.LastViewedAt()
		m.LastViewedAt = &lastViewedAt
	case *domain.LessonProgressTest:
		m.LessonType = string(domain.LessonTypeTest)
	}
	return m
}

func (m *LessonProgress) ToDomain() domain.LessonProgress {
	switch domain.LessonType(m.LessonType) {
	case domain.LessonTypeVideo:
		var lastViewedAt time.Time
		if m.LastViewedAt != nil {
			lastViewedAt = *m.LastViewedAt
		}
		return domain.UnmarshalLessonProgressVideo(
			m.ID, m.UserID, m.LessonID,
			m.IsCompleted, m.DeletedAt,
			m.WatchedSeconds, lastViewedAt,
		)
	case domain.LessonTypeTest:
		return domain.UnmarshalLessonProgressBase(m.ID, m.UserID, m.LessonID, m.IsCompleted, m.DeletedAt)
	}
	return domain.UnmarshalLessonProgressBase(m.ID, m.UserID, m.LessonID, m.IsCompleted, m.DeletedAt)
}
