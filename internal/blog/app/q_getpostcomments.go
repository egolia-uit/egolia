package app

import (
	"context"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type GetPostComments struct {
	PostID uuid.UUID
}

type GetPostCommentsHandler struct {
	readModel GetPostCommentsReadModel
}

func NewGetPostCommentsHandler(readModel GetPostCommentsReadModel) *GetPostCommentsHandler {
	return &GetPostCommentsHandler{readModel: readModel}
}

var _ commonhandler.Query[GetPostComments, []*Comment] = (*GetPostCommentsHandler)(nil)

func (h *GetPostCommentsHandler) Handle(ctx context.Context, query *GetPostComments) ([]*Comment, error) {
	return h.readModel.GetPostComments(ctx, query.PostID)
}
