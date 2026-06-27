package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Post struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey"`
	AuthorID     string         `gorm:"type:varchar(255);not null;index"`
	Title        string         `gorm:"type:text;not null"`
	Content      string         `gorm:"type:text;not null"`
	Tags         pq.StringArray `gorm:"type:text[];not null;index:,type:gin"`
	CommentCount int            `gorm:"not null;default:0"`
	CreatedAt    time.Time      `gorm:"not null"`
}

func PostFromDomain(post *domain.Post) *Post {
	if post == nil {
		return nil
	}
	return &Post{
		ID:           post.ID(),
		AuthorID:     post.AuthorID(),
		Title:        post.Title(),
		Content:      post.Content(),
		Tags:         pq.StringArray(post.Tags()),
		CommentCount: post.CommentCount(),
		CreatedAt:    post.CreatedAt(),
	}
}

func (m *Post) ToDomain() *domain.Post {
	if m == nil {
		return nil
	}
	return domain.UnmarshalPost(
		m.ID,
		m.AuthorID,
		m.Title,
		m.Content,
		[]string(m.Tags),
		m.CommentCount,
		m.CreatedAt,
	)
}
