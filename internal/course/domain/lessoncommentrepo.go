package domain

import (
	"context"

	"github.com/google/uuid"
)

type LessonCommentRepo interface {
	Get(ctx context.Context, params LessonCommentRepoGet) (*LessonComment, error)
	// For dealing with delete parent also recusively delete all children
	GetRecursive(ctx context.Context, params LessonCommentRepoGetRecursive) ([]*LessonComment, error)
	Save(ctx context.Context, lessonComment *LessonComment) error
}

type LessonCommentRepoGet struct {
	ID        uuid.UUID
	ForUpdate bool
}

type LessonCommentRepoGetRecursive struct {
	ParentID      uuid.UUID
	ExcludeParent bool
	ForUpdate     bool
}
