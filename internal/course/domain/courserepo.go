package domain

import (
	"context"

	"github.com/google/uuid"
)

type CourseRepo interface {
	Get(ctx context.Context, params CourseRepoGet) (*Course, error)
	Save(ctx context.Context, course *Course) error
}

type CourseRepoGet struct {
	ID        uuid.UUID
	ForUpdate bool
}
