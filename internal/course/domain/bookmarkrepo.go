package domain

import (
	"context"

	"github.com/google/uuid"
)

type BookmarkRepo interface {
	Get(ctx context.Context, params BookmarkRepoGet) (*Bookmark, error)
	Save(ctx context.Context, bookmark *Bookmark) error
}

type BookmarkRepoGet struct {
	ID        uuid.UUID
	ForUpdate bool
}
