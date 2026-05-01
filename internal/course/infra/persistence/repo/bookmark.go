package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookmarkRepo struct {
	db *gorm.DB
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 97d60f7c3 (feat: check backend)
func NewBookmarkRepo(db *gorm.DB) *BookmarkRepo {
	return &BookmarkRepo{db: db}
}

var _ domain.BookmarkRepo = (*BookmarkRepo)(nil)

func (r *BookmarkRepo) Get(ctx context.Context, params domain.BookmarkRepoGet, forUpdate bool) (*domain.Bookmark, error) {
<<<<<<< HEAD
=======
func (r *bookmarkRepo) Get(ctx context.Context, params domain.BookmarkRepoGet, forUpdate bool) (*domain.Bookmark, error) {
>>>>>>> 65e45e788 (feat: read model in)
=======
>>>>>>> 97d60f7c3 (feat: check backend)
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

func (r *BookmarkRepo) Save(ctx context.Context, bookmark *domain.Bookmark) error {
	m := model.BookmarkFromDomain(bookmark)
	return r.db.WithContext(ctx).Save(m).Error
}
