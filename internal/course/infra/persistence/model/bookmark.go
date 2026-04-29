package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type Bookmark struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID    string    `gorm:"column:user_id;type:text;not null"`
	CourseID  uuid.UUID `gorm:"type:uuid;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (Bookmark) TableName() string { return "bookmarks" }

func BookmarkFromDomain(b *domain.Bookmark) *Bookmark {
	return &Bookmark{
		ID:        b.ID(),
		UserID:    b.UserID(),
		CourseID:  b.CourseID(),
		CreatedAt: time.Time{},
	}
}

func (m *Bookmark) ToDomain() *domain.Bookmark {
	return domain.UnmarshalBookmark(m.ID, m.UserID, m.CourseID)
}
