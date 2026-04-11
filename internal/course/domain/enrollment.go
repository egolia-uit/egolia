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

func NewEnrollment(
	id uuid.UUID,
	learnerID string,
	courseID uuid.UUID,
	enrollmentDate time.Time,
) *Enrollment {
	return &Enrollment{
		id:             id,
		learnerID:      learnerID,
		courseID:       courseID,
		enrollmentDate: enrollmentDate,
		completedAt:    nil,
	}
}

func UnmarshalEnrollment(
	id uuid.UUID,
	learnerID string,
	courseID uuid.UUID,
	enrollmentDate time.Time,
	completedAt *time.Time,
) *Enrollment {
	return &Enrollment{
		id:             id,
		learnerID:      learnerID,
		courseID:       courseID,
		enrollmentDate: enrollmentDate,
		completedAt:    completedAt,
	}
}

func (e *Enrollment) ID() uuid.UUID {
	return e.id
}

func (e *Enrollment) LearnerID() string {
	return e.learnerID
}

func (e *Enrollment) CourseID() uuid.UUID {
	return e.courseID
}

func (e *Enrollment) EnrollmentDate() time.Time {
	return e.enrollmentDate
}

func (e *Enrollment) CompletedAt() *time.Time {
	return e.completedAt
}

func (e *Enrollment) Complete() {
	e.completedAt = new(time.Time)
	*e.completedAt = time.Now()
}
