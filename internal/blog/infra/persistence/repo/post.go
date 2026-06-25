package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostRepo struct {
	db *gorm.DB
}

func NewPostRepo(db *gorm.DB) *PostRepo {
	return &PostRepo{db: db}
}

var _ domain.PostRepo = (*PostRepo)(nil)

func (r *PostRepo) Get(ctx context.Context, id uuid.UUID) (*domain.Post, error) {
	var m model.Post
	if err := r.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *PostRepo) Save(ctx context.Context, post *domain.Post) error {
	m := model.PostFromDomain(post)
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *PostRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(new(model.Post), "id = ?", id).Error
}
