package domain

import (
	"strings"
	"time"

	"github.com/egolia-uit/egolia/internal/blog/errs"
	"github.com/google/uuid"
)

type Post struct {
	id           uuid.UUID
	authorID     string
	title        string
	content      string
	tags         []string
	commentCount int
	createdAt    time.Time
}

func NewPost(
	id uuid.UUID,
	authorID string,
	title string,
	content string,
	tags []string,
) (*Post, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return nil, errs.NewInvalid("title is required")
	}
	content = strings.TrimSpace(content)
	if content == "" {
		return nil, errs.NewInvalid("content is required")
	}
	if tags == nil {
		tags = []string{}
	}
	return &Post{
		id:           id,
		authorID:     authorID,
		title:        title,
		content:      content,
		tags:         tags,
		commentCount: 0,
		createdAt:    time.Now(),
	}, nil
}

func UnmarshalPost(
	id uuid.UUID,
	authorID string,
	title string,
	content string,
	tags []string,
	commentCount int,
	createdAt time.Time,
) *Post {
	if tags == nil {
		tags = []string{}
	}
	return &Post{
		id:           id,
		authorID:     authorID,
		title:        title,
		content:      content,
		tags:         tags,
		commentCount: commentCount,
		createdAt:    createdAt,
	}
}

func (p *Post) ID() uuid.UUID        { return p.id }
func (p *Post) AuthorID() string     { return p.authorID }
func (p *Post) Title() string        { return p.title }
func (p *Post) Content() string      { return p.content }
func (p *Post) Tags() []string       { return p.tags }
func (p *Post) CommentCount() int    { return p.commentCount }
func (p *Post) CreatedAt() time.Time { return p.createdAt }

func (p *Post) SetTitle(title string) error {
	title = strings.TrimSpace(title)
	if title == "" {
		return errs.NewInvalid("title is required")
	}
	p.title = title
	return nil
}

func (p *Post) SetContent(content string) error {
	content = strings.TrimSpace(content)
	if content == "" {
		return errs.NewInvalid("content is required")
	}
	p.content = content
	return nil
}

func (p *Post) SetTags(tags []string) {
	if tags == nil {
		tags = []string{}
	}
	p.tags = tags
}

func (p *Post) CanUserEdit(userID string, userRoles []string) error {
	if hasRole(userRoles, "admin") {
		return nil
	}
	if p.authorID != userID {
		return errs.NewForbidden("only the author or admin can modify this post")
	}
	return nil
}

func (p *Post) IncrementCommentCount() {
	p.commentCount++
}

func (p *Post) DecrementCommentCount(n int) {
	p.commentCount -= n
	if p.commentCount < 0 {
		p.commentCount = 0
	}
}

func hasRole(roles []string, target string) bool {
	for _, r := range roles {
		if r == target {
			return true
		}
	}
	return false
}
