package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookmarkRepo struct {
	db *gorm.DB
}

func NewBookmarkRepo(db *gorm.DB) *BookmarkRepo {
	return &BookmarkRepo{db: db}
}

var _ domain.BookmarkRepo = (*BookmarkRepo)(nil)

// DeleteByUserAndCourse implements [domain.BookmarkRepo].
func (r *BookmarkRepo) DeleteByUserAndCourse(ctx context.Context, userID string, courseID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Delete(new(model.Bookmark)).Error
}

func (r *BookmarkRepo) Get(ctx context.Context, params domain.BookmarkRepoGet, forUpdate bool) (*domain.Bookmark, error) {
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

func (r *BookmarkRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(new(model.Bookmark), "id = ?", id).Error
}

func (r *BookmarkRepo) ExistsByUserAndCourse(ctx context.Context, userID string, courseID uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(new(model.Bookmark)).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
