package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/blog/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GetPostById struct {
	PostID uuid.UUID
}

type GetPostByIdHandler struct {
	readModel GetPostByIdReadModel
}

func NewGetPostByIdHandler(readModel GetPostByIdReadModel) *GetPostByIdHandler {
	return &GetPostByIdHandler{readModel: readModel}
}

var _ commonhandler.Query[GetPostById, *Post] = (*GetPostByIdHandler)(nil)

func (h *GetPostByIdHandler) Handle(ctx context.Context, query *GetPostById) (*Post, error) {
	post, err := h.readModel.GetPostById(ctx, query.PostID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.NewPostNotFoundErr(query.PostID)
		}
		return nil, err
	}
	return post, nil
}
