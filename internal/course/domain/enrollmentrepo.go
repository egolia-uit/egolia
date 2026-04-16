package domain

import (
	"context"

	"github.com/google/uuid"
)

type EnrollmentRepo interface {
	GetByID(ctx context.Context, params EnrollmentRepoGetByID, forUpdate bool) (*Enrollment, error)
	Save(ctx context.Context, enrollment *Enrollment) error
}

type EnrollmentRepoGetByID struct {
	ID uuid.UUID
}
