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
