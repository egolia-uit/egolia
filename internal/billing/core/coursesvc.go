package core

import (
	"context"

	"github.com/google/uuid"
)

type Course struct {
	ID           uuid.UUID
	Title        string
	InstructorID string
	// Status??

	Price int64
}

type CourseSvc interface {
	GetCourse(ctx context.Context, id uuid.UUID) (*Course, error)
}
