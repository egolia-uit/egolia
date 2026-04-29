package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type Enrollment struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey"`
	CourseID       uuid.UUID  `gorm:"type:uuid;not null"`
	LearnerID      string     `gorm:"column:learner_id;type:text;not null"`
	EnrollmentDate time.Time  `gorm:"column:enrolled_at;autoCreateTime"`
	CompletedAt    *time.Time `gorm:"column:completed_at"`
	ExpiredAt      *time.Time `gorm:"column:expired_at"`
	CreatedAt      time.Time  `gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime"`
}

func (Enrollment) TableName() string { return "enrollments" }

func EnrollmentFromDomain(e *domain.Enrollment) *Enrollment {
	return &Enrollment{
		ID:             e.ID(),
		CourseID:       e.CourseID(),
		LearnerID:      e.LearnerID(),
		EnrollmentDate: e.EnrollmentDate(),
		CompletedAt:    e.CompletedAt(),
		ExpiredAt:      e.ExpiredAt(),
		CreatedAt:      time.Time{},
		UpdatedAt:      time.Time{},
	}
}

func (m *Enrollment) ToDomain() *domain.Enrollment {
	return domain.UnmarshalEnrollment(m.ID, m.LearnerID, m.CourseID, m.EnrollmentDate, m.CompletedAt, m.ExpiredAt)
}
