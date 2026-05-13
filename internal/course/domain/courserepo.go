package domain

import (
	"context"

	"github.com/google/uuid"
)

type CourseRepo interface {
	// Get is for read course, it will not return deleted sections and lessons.
	Get(ctx context.Context, params CourseRepoGet, forUpdate bool) (*Course, error)
	GetDraftVersion(ctx context.Context, originalCourseID uuid.UUID, status CourseStatus) (*Course, error)
	Save(ctx context.Context, course *Course) error
	ExistsDraftVersion(ctx context.Context, originalCourseID uuid.UUID) (bool, error)
	// GetFull is for update course, it will return course with all sections and lessons, even if these sections and lessons are deleted.
	GetFull(ctx context.Context, id uuid.UUID) (*Course, error)
}

type CourseRepoGet struct {
	ID uuid.UUID
}
