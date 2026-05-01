package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type certificateRepo struct {
	db *gorm.DB
}

func (r *certificateRepo) Get(ctx context.Context, params domain.CertificateRepoGet, forUpdate bool) (*domain.Certificate, error) {
	db := r.db.WithContext(ctx)
	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.Certificate
	if err := db.First(&m, "id = ?", params.ID).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

// CertificateRepo.Save does not take context (per domain interface)
func (r *certificateRepo) Save(certificate *domain.Certificate) error {
	m := model.CertificateFromDomain(certificate)
	return r.db.Save(m).Error
}
