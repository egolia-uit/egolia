package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type lessonCommentRepo struct {
	db *gorm.DB
}

func (r *lessonCommentRepo) Get(ctx context.Context, params domain.LessonCommentRepoGet, forUpdate bool) (*domain.LessonComment, error) {
	db := txOrDB(ctx, r.db)
	if forUpdate {
		db = db.Clauses(clause.Locking{Strength: "UPDATE"})
	}

	var m model.LessonComment
	if err := db.First(&m, "id = ?", params.ID).Error; err != nil {
		return nil, err
	}
	return m.ToDomain(), nil
}

// GetRecursive uses a Postgres recursive CTE to fetch a comment and all its descendants.
func (r *lessonCommentRepo) GetRecursive(ctx context.Context, params domain.LessonCommentRepoGetRecursive, forUpdate bool) ([]*domain.LessonComment, error) {
	db := txOrDB(ctx, r.db)

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

func (r *lessonCommentRepo) Save(ctx context.Context, lessonComment *domain.LessonComment) error {
	m := model.LessonCommentFromDomain(lessonComment)
	return txOrDB(ctx, r.db).Save(m).Error
}
