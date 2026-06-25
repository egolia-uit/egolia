package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/google/uuid"
)

type Comment struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey"`
	PostID          uuid.UUID  `gorm:"type:uuid;not null;index"`
	AuthorID        string     `gorm:"type:varchar(255);not null;index"`
	Content         string     `gorm:"type:text;not null"`
	ParentCommentID *uuid.UUID `gorm:"type:uuid;index"`
	CreatedAt       time.Time  `gorm:"not null"`
}

func CommentFromDomain(comment *domain.Comment) *Comment {
	if comment == nil {
		return nil
	}
	return &Comment{
		ID:              comment.ID(),
		PostID:          comment.PostID(),
		AuthorID:        comment.AuthorID(),
		Content:         comment.Content(),
		ParentCommentID: comment.ParentCommentID(),
		CreatedAt:       comment.CreatedAt(),
	}
}

func (m *Comment) ToDomain() *domain.Comment {
	if m == nil {
		return nil
	}
	return domain.UnmarshalComment(
		m.ID,
		m.PostID,
		m.AuthorID,
		m.Content,
		m.ParentCommentID,
		m.CreatedAt,
	)
}
