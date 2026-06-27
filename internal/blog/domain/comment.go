package domain

import (
	"strings"
	"time"

	"github.com/egolia-uit/egolia/internal/blog/errs"
	"github.com/google/uuid"
)

type Comment struct {
	id              uuid.UUID
	postID          uuid.UUID
	authorID        string
	content         string
	parentCommentID *uuid.UUID
	createdAt       time.Time
}

func NewComment(
	id uuid.UUID,
	postID uuid.UUID,
	authorID string,
	content string,
	parentCommentID *uuid.UUID,
) (*Comment, error) {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil, errs.NewInvalid("content is required")
	}
	return &Comment{
		id:              id,
		postID:          postID,
		authorID:        authorID,
		content:         content,
		parentCommentID: parentCommentID,
		createdAt:       time.Now(),
	}, nil
}

func UnmarshalComment(
	id uuid.UUID,
	postID uuid.UUID,
	authorID string,
	content string,
	parentCommentID *uuid.UUID,
	createdAt time.Time,
) *Comment {
	return &Comment{
		id:              id,
		postID:          postID,
		authorID:        authorID,
		content:         content,
		parentCommentID: parentCommentID,
		createdAt:       createdAt,
	}
}

func (c *Comment) ID() uuid.UUID               { return c.id }
func (c *Comment) PostID() uuid.UUID           { return c.postID }
func (c *Comment) AuthorID() string            { return c.authorID }
func (c *Comment) Content() string             { return c.content }
func (c *Comment) ParentCommentID() *uuid.UUID { return c.parentCommentID }
func (c *Comment) CreatedAt() time.Time        { return c.createdAt }

func (c *Comment) SetContent(content string) error {
	content = strings.TrimSpace(content)
	if content == "" {
		return errs.NewInvalid("content is required")
	}
	c.content = content
	return nil
}

func (c *Comment) CanUserEdit(userID string, userRoles []string) error {
	if hasRole(userRoles, "admin") {
		return nil
	}
	if c.authorID != userID {
		return errs.NewForbidden("only the author or admin can modify this comment")
	}
	return nil
}
