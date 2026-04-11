package domain

import (
	"time"

	"github.com/google/uuid"
)

type Section struct {
	id        uuid.UUID
	courseID  uuid.UUID
	title     string
	order     string
	deletedAt *time.Time
}
