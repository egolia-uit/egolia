package domain

import (
	"time"

	"github.com/google/uuid"
)

type Certificate struct {
	id             uuid.UUID
	courseID       uuid.UUID
	userID         string
	issuedAt       time.Time
	certificateURL string
	createdAt      *time.Time
}

func NewCertificate(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	issuedAt time.Time,
) *Certificate {
	return &Certificate{
		id:             id,
		courseID:       courseID,
		userID:         userID,
		issuedAt:       issuedAt,
		certificateURL: "",
		createdAt:      nil,
	}
}

func UnmarshalCertificate(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	issuedAt time.Time,
	certificateURL string,
	createdAt *time.Time,
) *Certificate {
	return &Certificate{
		id:             id,
		courseID:       courseID,
		userID:         userID,
		issuedAt:       issuedAt,
		certificateURL: certificateURL,
		createdAt:      createdAt,
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

func (c *Certificate) CertificateURL() string {
	return c.certificateURL
}

func (c *Certificate) SetCertificateURL(url string) {
	c.certificateURL = url
}

func (c *Certificate) CreatedAt() *time.Time {
	return c.createdAt
}

func (c *Certificate) SetCreatedAt(createdAt *time.Time) {
	c.createdAt = createdAt
}
