package domain

import (
	"time"

	"github.com/google/uuid"
)

type Certificate struct {
	id        uuid.UUID
	courseID  uuid.UUID
	userID    string
	issuedAt  time.Time
	deletedAt *time.Time
}
