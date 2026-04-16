package domain

import (
	"context"

	"github.com/google/uuid"
)

type CertificateRepo interface {
	Get(ctx context.Context, params CertificateRepoGet, forUpdate bool) (*Certificate, error)
	Save(certificate *Certificate) error
}

type CertificateRepoGet struct {
	ID uuid.UUID
}
