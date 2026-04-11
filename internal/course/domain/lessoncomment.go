package domain

import (
	"time"

	"github.com/google/uuid"
)

// NOTE: for returning in app layer, maybe fe need recusive struct
// TODO: Deal with delete parent also recusively delete all children
type LessonComment struct {
	id              uuid.UUID
	userID          string
	lessonID        uuid.UUID
	content         string
	createdAt       time.Time
	parentCommentID *uuid.UUID
	deletedAt       *time.Time
}

func NewLessonComment(
	id uuid.UUID,
	userID string,
	lessonID uuid.UUID,
	content string,
	parentCommentID *uuid.UUID,
) *LessonComment {
	return &LessonComment{
		id:              id,
		userID:          userID,
		lessonID:        lessonID,
		content:         content,
		createdAt:       time.Now(),
		parentCommentID: parentCommentID,
		deletedAt:       nil,
	}
}

func UnmarshalLessonComment(
	id uuid.UUID,
	userID string,
	lessonID uuid.UUID,
	content string,
	createdAt time.Time,
	parentCommentID *uuid.UUID,
	deletedAt *time.Time,
) *LessonComment {
	return &LessonComment{
		id:              id,
		userID:          userID,
		lessonID:        lessonID,
		content:         content,
		createdAt:       createdAt,
		parentCommentID: parentCommentID,
		deletedAt:       deletedAt,
	}
}

func (lc *LessonComment) ID() uuid.UUID {
	return lc.id
}

func (lc *LessonComment) UserID() string {
	return lc.userID
}

func (lc *LessonComment) LessonID() uuid.UUID {
	return lc.lessonID
}

func (lc *LessonComment) Content() string {
	return lc.content
}

func (lc *LessonComment) SetContent(content string) {
	lc.content = content
}

func (lc *LessonComment) CreatedAt() time.Time {
	return lc.createdAt
}

func (lc *LessonComment) ParentCommentID() *uuid.UUID {
	return lc.parentCommentID
}

func (lc *LessonComment) DeletedAt() *time.Time {
	return lc.deletedAt
}

func (lc *LessonComment) Delete() {
	lc.deletedAt = new(time.Time)
	*lc.deletedAt = time.Now()
}
