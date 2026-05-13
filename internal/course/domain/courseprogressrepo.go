package domain

import (
	"context"

	"github.com/google/uuid"
)

type CourseProgressRepo interface {
	Get(ctx context.Context, params CourseProgressRepoGet, forUpdate bool) (*CourseProgress, error)
	Save(progress *CourseProgress) error
}

type CourseProgressRepoGet struct {
	CourseID uuid.UUID
	UserID   string
}

type CourseProgress struct {
	ID       uuid.UUID
	CourseID uuid.UUID
	UserID   string
	Progress float64 // 0.0 to 100.0
}
