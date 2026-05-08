package domain

import (
	"context"

	"github.com/google/uuid"
)

type BookmarkRepo interface {
	Save(ctx context.Context, bookmark *Bookmark) error
	Delete(ctx context.Context, id uuid.UUID) error
	ExistsByUserAndCourse(ctx context.Context, userID string, courseID uuid.UUID) (bool, error)
}

type BookmarkRepoGet struct {
	ID uuid.UUID
}
