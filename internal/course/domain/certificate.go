package domain

import (
	"time"

	"github.com/google/uuid"
)

type Certificate struct {
	id        uuid.UUID
	courseID  uuid.UUID
	userID    string
	createdAt time.Time
}

func NewCertificate(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
) *Certificate {
	return &Certificate{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		createdAt: time.Now(),
	}
}

func UnmarshalCertificate(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	createdAt time.Time,
) *Certificate {
	return &Certificate{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		createdAt: createdAt,
	}
}

func (c *Certificate) ID() uuid.UUID {
	return c.id
}

func (c *Certificate) CourseID() uuid.UUID {
	return c.courseID
}

func (c *Certificate) UserID() string {
	return c.userID
}

func (c *Certificate) CreatedAt() time.Time {
	return c.createdAt
}
