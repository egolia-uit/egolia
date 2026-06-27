package app

import (
	"context"

	"github.com/google/uuid"
)

type SearchPostsParams struct {
	Query    *string
	Tag      *string
	Paginate PaginationParams
	Order    *SearchPostsOrder
}

type SearchPostsReadModel interface {
	SearchPosts(ctx context.Context, params *SearchPostsParams) (*Paginated[Post], error)
}

type GetPostByIdReadModel interface {
	GetPostById(ctx context.Context, id uuid.UUID) (*Post, error)
}

type GetPostCommentsReadModel interface {
	GetPostComments(ctx context.Context, postID uuid.UUID) ([]*Comment, error)
}
