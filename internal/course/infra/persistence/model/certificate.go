package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type Certificate struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	CourseID  uuid.UUID `gorm:"type:uuid;not null"`
	UserID    string    `gorm:"column:user_id;type:text;not null"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime"`
}

func (Certificate) TableName() string { return "certificates" }

func CertificateFromDomain(c *domain.Certificate) *Certificate {
	return &Certificate{
		ID:        c.ID(),
		CourseID:  c.CourseID(),
		UserID:    c.UserID(),
		CreatedAt: c.CreatedAt(),
	}
}

func (m *Certificate) ToDomain() *domain.Certificate {
	return domain.UnmarshalCertificate(m.ID, m.CourseID, m.UserID, m.CreatedAt)
}
