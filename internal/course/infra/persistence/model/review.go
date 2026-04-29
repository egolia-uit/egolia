package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Review struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
	CourseID  uuid.UUID      `gorm:"type:uuid;not null"`
	UserID    string         `gorm:"column:user_id;type:text;not null"`
	Rating    int            `gorm:"not null"`
	Comment   string         `gorm:"type:text"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (Review) TableName() string { return "reviews" }

func ReviewFromDomain(r *domain.Review) *Review {
	var deletedAt gorm.DeletedAt
	if r.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *r.DeletedAt(), Valid: true}
	}
	return &Review{
		ID:        r.ID(),
		CourseID:  r.CourseID(),
		UserID:    r.UserID(),
		Rating:    r.Rating(),
		Comment:   r.Comment(),
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
		DeletedAt: deletedAt,
	}
}

func (m *Review) ToDomain() *domain.Review {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}
	return domain.UnmarshalReview(m.ID, m.CourseID, m.UserID, m.Rating, m.Comment, deletedAt)
}
