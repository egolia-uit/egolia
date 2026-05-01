package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CertificateRepo struct {
	db *gorm.DB
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 97d60f7c3 (feat: check backend)
func NewCertificateRepo(db *gorm.DB) *CertificateRepo {
	return &CertificateRepo{db: db}
}

var _ domain.CertificateRepo = (*CertificateRepo)(nil)

func (r *CertificateRepo) Get(ctx context.Context, params domain.CertificateRepoGet, forUpdate bool) (*domain.Certificate, error) {
<<<<<<< HEAD
=======
func (r *certificateRepo) Get(ctx context.Context, params domain.CertificateRepoGet, forUpdate bool) (*domain.Certificate, error) {
>>>>>>> 65e45e788 (feat: read model in)
=======
>>>>>>> 97d60f7c3 (feat: check backend)
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
func (r *CertificateRepo) Save(certificate *domain.Certificate) error {
	m := model.CertificateFromDomain(certificate)
	return r.db.Save(m).Error
}
