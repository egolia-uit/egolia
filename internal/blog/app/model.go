package app

import (
	"time"

	"github.com/google/uuid"
)

type PaginationParams struct {
	Page  int
	Limit int
}

type Pagination struct {
	Page       int
	Limit      int
	Total      int
	TotalPages int
	HasNext    bool
	HasPrev    bool
}

type Paginated[T any] struct {
	Data       []T
	Pagination Pagination
}

type SearchPostsOrder string

const (
	SearchPostsOrderAsc  SearchPostsOrder = "asc"
	SearchPostsOrderDesc SearchPostsOrder = "desc"
)

type Post struct {
	ID           uuid.UUID
	AuthorID     string
	Title        string
	Content      string
	Tags         []string
	CommentCount int
	CreatedAt    time.Time
}

type Comment struct {
	ID              uuid.UUID
	PostID          uuid.UUID
	AuthorID        string
	Content         string
	ParentCommentID *uuid.UUID
	CreatedAt       time.Time
}
