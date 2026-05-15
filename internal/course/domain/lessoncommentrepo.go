package domain

import (
	"context"

	"github.com/google/uuid"
)

type LessonCommentRepo interface {
	Get(ctx context.Context, params LessonCommentRepoGet) (*LessonComment, error)
	GetRecursive(ctx context.Context, params LessonCommentRepoGetRecursive, forUpdate bool) ([]*LessonComment, error)
	Save(ctx context.Context, lessonComment *LessonComment) error
	DeleteReplies(ctx context.Context, commentID uuid.UUID) error
}

type LessonCommentRepoGet struct {
	ID uuid.UUID
}

type LessonCommentRepoGetRecursive struct {
	ParentID      uuid.UUID
	ExcludeParent bool
}
