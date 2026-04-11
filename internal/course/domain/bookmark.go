package domain

import "github.com/google/uuid"

type Bookmark struct {
	id       uuid.UUID
	userID   string
	courseID uuid.UUID
}
