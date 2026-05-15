package readmodel

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
)

type LessonCommentReadRepo struct {
	db *gorm.DB
}

func NewLessonCommentReadRepo(db *gorm.DB) *LessonCommentReadRepo {
	return &LessonCommentReadRepo{db: db}
}

var _ app.GetLessonCommentsReadModel = (*LessonCommentReadRepo)(nil)

func (r *LessonCommentReadRepo) GetLessonComments(ctx context.Context, params *app.GetLessonComments) ([]*app.LessonComment, error) {
	var ms []model.LessonComment
	err := r.db.WithContext(ctx).
		Where("lesson_id = ?", params.LessonID).
		Order("created_at ASC").
		Find(&ms).Error
	if err != nil {
		return nil, err
	}
	comments := make([]*app.LessonComment, len(ms))
	for i, m := range ms {
		comments[i] = &app.LessonComment{
			ID:              m.ID,
			UserID:          m.UserID,
			LessonID:        m.LessonID,
			Content:         m.Content,
			CreatedAt:       m.CreatedAt,
			ParentCommentID: m.ParentCommentID,
		}
	}
	return comments, nil
}
