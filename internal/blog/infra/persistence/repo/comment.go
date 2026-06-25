package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentRepo struct {
	db *gorm.DB
}

func NewCommentRepo(db *gorm.DB) *CommentRepo {
	return &CommentRepo{db: db}
}

var _ domain.CommentRepo = (*CommentRepo)(nil)

func (r *CommentRepo) Get(ctx context.Context, id uuid.UUID) (*domain.Comment, error) {
	var m model.Comment
	if err := r.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *CommentRepo) Save(ctx context.Context, comment *domain.Comment) error {
	m := model.CommentFromDomain(comment)
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *CommentRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(new(model.Comment), "id = ?", id).Error
}

func (r *CommentRepo) DeleteByPostID(ctx context.Context, postID uuid.UUID) (int, error) {
	tx := r.db.WithContext(ctx).Where("post_id = ?", postID).Delete(new(model.Comment))
	return int(tx.RowsAffected), tx.Error
}

func (r *CommentRepo) DeleteReplies(ctx context.Context, commentID uuid.UUID) (int, error) {
	tx := r.db.WithContext(ctx).Where("parent_comment_id = ?", commentID).Delete(new(model.Comment))
	return int(tx.RowsAffected), tx.Error
}
