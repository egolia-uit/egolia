package domain

import (
	"context"

	"github.com/google/uuid"
)

type LessonCommentRepo interface {
	Get(ctx context.Context, params LessonCommentRepoGet, forUpdate bool) (*LessonComment, error)
	// For dealing with delete parent also recusively delete all children
	GetRecursive(ctx context.Context, params LessonCommentRepoGetRecursive, forUpdate bool) ([]*LessonComment, error)
	Save(ctx context.Context, lessonComment *LessonComment) error
}

type LessonCommentRepoGet struct {
	ID uuid.UUID
}

type LessonCommentRepoGetRecursive struct {
	ParentID      uuid.UUID
	ExcludeParent bool
}
