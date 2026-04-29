package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Certificate struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey"`
	CourseID       uuid.UUID      `gorm:"type:uuid;not null"`
	UserID         string         `gorm:"column:user_id;type:text;not null"`
	IssuedAt       time.Time      `gorm:"column:issued_at;autoCreateTime"`
	CertificateURL string         `gorm:"column:certificate_url;type:varchar(1024);not null;default:''"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

func (Certificate) TableName() string { return "certificates" }

func CertificateFromDomain(c *domain.Certificate) *Certificate {
	var deletedAt gorm.DeletedAt
	if c.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *c.DeletedAt(), Valid: true}
	}
	return &Certificate{
		ID:             c.ID(),
		CourseID:       c.CourseID(),
		UserID:         c.UserID(),
		IssuedAt:       c.IssuedAt(),
		CertificateURL: c.CertificateURL(),
		DeletedAt:      deletedAt,
	}
}

func (m *Certificate) ToDomain() *domain.Certificate {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}
	return domain.UnmarshalCertificate(m.ID, m.CourseID, m.UserID, m.IssuedAt, m.CertificateURL, deletedAt)
}
