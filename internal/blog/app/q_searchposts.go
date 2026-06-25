package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type SearchPosts struct {
	Query    *string
	Tag      *string
	Paginate PaginationParams
	Order    *SearchPostsOrder
}

type SearchPostsHandler struct {
	readModel SearchPostsReadModel
}

func NewSearchPostsHandler(readModel SearchPostsReadModel) *SearchPostsHandler {
	return &SearchPostsHandler{readModel: readModel}
}

var _ commonhandler.Query[SearchPosts, *Paginated[Post]] = (*SearchPostsHandler)(nil)

func (h *SearchPostsHandler) Handle(ctx context.Context, query *SearchPosts) (*Paginated[Post], error) {
	return h.readModel.SearchPosts(ctx, &SearchPostsParams{
		Query:    query.Query,
		Tag:      query.Tag,
		Paginate: query.Paginate,
		Order:    query.Order,
	})
}
