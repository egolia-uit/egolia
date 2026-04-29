package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LessonComment struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey"`
	UserID          string         `gorm:"column:user_id;type:text;not null"`
	LessonID        uuid.UUID      `gorm:"type:uuid;not null"`
	Content         string         `gorm:"type:text;not null"`
	ParentCommentID *uuid.UUID     `gorm:"type:uuid"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
	DeletedAt       gorm.DeletedAt `gorm:"index"`
}

func (LessonComment) TableName() string { return "lesson_comments" }

func LessonCommentFromDomain(lc *domain.LessonComment) *LessonComment {
	var deletedAt gorm.DeletedAt
	if lc.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *lc.DeletedAt(), Valid: true}
	}
	return &LessonComment{
		ID:              lc.ID(),
		UserID:          lc.UserID(),
		LessonID:        lc.LessonID(),
		Content:         lc.Content(),
		ParentCommentID: lc.ParentCommentID(),
		CreatedAt:       lc.CreatedAt(),
		UpdatedAt:       time.Time{},
		DeletedAt:       deletedAt,
	}
}

func (m *LessonComment) ToDomain() *domain.LessonComment {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}
	return domain.UnmarshalLessonComment(
		m.ID, m.UserID, m.LessonID, m.Content,
		m.CreatedAt, m.ParentCommentID, deletedAt,
	)
}
