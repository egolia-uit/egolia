package readmodel

import (
	"context"

	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentReadRepo struct {
	db *gorm.DB
}

func NewCommentReadRepo(db *gorm.DB) *CommentReadRepo {
	return &CommentReadRepo{db: db}
}

var _ app.GetPostCommentsReadModel = (*CommentReadRepo)(nil)

func (r *CommentReadRepo) GetPostComments(ctx context.Context, postID uuid.UUID) ([]*app.Comment, error) {
	var ms []model.Comment
	if err := r.db.WithContext(ctx).Where("post_id = ?", postID).Order("created_at ASC").Find(&ms).Error; err != nil {
		return nil, err
	}
	comments := make([]*app.Comment, len(ms))
	for i, m := range ms {
		comments[i] = &app.Comment{
			ID:              m.ID,
			PostID:          m.PostID,
			AuthorID:        m.AuthorID,
			Content:         m.Content,
			ParentCommentID: m.ParentCommentID,
			CreatedAt:       m.CreatedAt,
		}
	}
	return comments, nil
}
