package domain

import (
	"time"

	"github.com/google/uuid"
)

type Enrollment struct {
	id             uuid.UUID
	learnerID      string
	courseID       uuid.UUID
	enrollmentDate time.Time
	completedAt    *time.Time
}
