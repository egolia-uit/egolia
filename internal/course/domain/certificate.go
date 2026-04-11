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

func NewCertificate(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	issuedAt time.Time,
) *Certificate {
	return &Certificate{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		issuedAt:  issuedAt,
		deletedAt: nil,
	}
}

func UnmarshalCertificate(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	issuedAt time.Time,
	deletedAt *time.Time,
) *Certificate {
	return &Certificate{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		issuedAt:  issuedAt,
		deletedAt: deletedAt,
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

func (c *Certificate) IssuedAt() time.Time {
	return c.issuedAt
}

func (c *Certificate) DeletedAt() *time.Time {
	return c.deletedAt
}

func (c *Certificate) Delete() {
	c.deletedAt = new(time.Time)
	*c.deletedAt = time.Now()
}
