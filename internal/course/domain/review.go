package domain

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	id        uuid.UUID
	courseID  uuid.UUID
	userID    string
	rating    int
	comment   string
	deletedAt *time.Time
}
