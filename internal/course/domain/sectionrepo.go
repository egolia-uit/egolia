package domain

import (
	"context"

	"github.com/google/uuid"
)

type SectionRepo interface {
	Get(ctx context.Context, params SectionRepoGet, forUpdate bool) (*Section, error)
	Save(ctx context.Context, section *Section) error
}

type SectionRepoGet struct {
	ID uuid.UUID
}
