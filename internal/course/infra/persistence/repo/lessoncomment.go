package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LessonCommentRepo struct {
	db *gorm.DB
}

func NewLessonCommentRepo(db *gorm.DB) *LessonCommentRepo {
	return &LessonCommentRepo{db: db}
}

var _ domain.LessonCommentRepo = (*LessonCommentRepo)(nil)

func (r *LessonCommentRepo) Get(ctx context.Context, params domain.LessonCommentRepoGet) (*domain.LessonComment, error) {
	var m model.LessonComment
	if err := r.db.WithContext(ctx).First(&m, "id = ?", params.ID).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *LessonCommentRepo) DeleteReplies(ctx context.Context, commentID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("parent_comment_id = ?", commentID).
		Delete(new(model.LessonComment)).Error
}

// GetRecursive uses a Postgres recursive CTE to fetch a comment and all its descendants.
func (r *LessonCommentRepo) GetRecursive(ctx context.Context, params domain.LessonCommentRepoGetRecursive, forUpdate bool) ([]*domain.LessonComment, error) {
	db := r.db.WithContext(ctx)

	lockClause := ""
	if forUpdate {
		lockClause = "FOR UPDATE"
	}

	query := `
WITH RECURSIVE comment_tree AS (
  SELECT * FROM lesson_comments WHERE id = @parentID AND deleted_at IS NULL
  UNION ALL
  SELECT c.* FROM lesson_comments c
    INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE c.deleted_at IS NULL
)
SELECT * FROM comment_tree ` + lockClause

	var rows []model.LessonComment
	if err := db.Raw(query, map[string]any{"parentID": params.ParentID}).Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.LessonComment, 0, len(rows))
	for i, row := range rows {
		if params.ExcludeParent && row.ID == params.ParentID {
			continue
		}
		result = append(result, rows[i].ToDomain())
	}
	return result, nil
}

func (r *LessonCommentRepo) Save(ctx context.Context, lessonComment *domain.LessonComment) error {
	m := model.LessonCommentFromDomain(lessonComment)
	return r.db.WithContext(ctx).Save(m).Error
}
