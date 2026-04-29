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
	db := txOrDB(ctx, r.db)
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
	return txOrDB(ctx, r.db).Save(m).Error
}
