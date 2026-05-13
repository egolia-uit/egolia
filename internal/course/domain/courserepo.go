package domain

import (
	"context"

	"github.com/google/uuid"
)

type CourseRepo interface {
	Get(ctx context.Context, params CourseRepoGet, forUpdate bool) (*Course, error)
	GetDraftVersion(ctx context.Context, originalCourseID uuid.UUID, status CourseStatus) (*Course, error)
	Save(ctx context.Context, course *Course) error
	ExistsDraftVersion(ctx context.Context, originalCourseID uuid.UUID) (bool, error)
}

type CourseRepoGet struct {
	ID uuid.UUID
}
