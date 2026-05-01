package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type bookmarkRepo struct {
	db *gorm.DB
}

func (r *bookmarkRepo) Get(ctx context.Context, params domain.BookmarkRepoGet, forUpdate bool) (*domain.Bookmark, error) {
	db := r.db.WithContext(ctx)
	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.Bookmark
	if err := db.First(&m, "id = ?", params.ID).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *bookmarkRepo) Save(ctx context.Context, bookmark *domain.Bookmark) error {
	m := model.BookmarkFromDomain(bookmark)
	return r.db.WithContext(ctx).Save(m).Error
}
