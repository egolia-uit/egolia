package domain

import (
	"context"

	"github.com/google/uuid"
)

type CommentRepo interface {
	Get(ctx context.Context, id uuid.UUID) (*Comment, error)
	Save(ctx context.Context, comment *Comment) error
	// Delete removes a comment. Returns count of rows deleted (1 for the comment itself).
	Delete(ctx context.Context, id uuid.UUID) error
	// DeleteByPostID removes all comments for a post. Returns count deleted.
	DeleteByPostID(ctx context.Context, postID uuid.UUID) (int, error)
	// DeleteReplies removes all replies (children) of a comment. Returns count deleted.
	DeleteReplies(ctx context.Context, commentID uuid.UUID) (int, error)
}
