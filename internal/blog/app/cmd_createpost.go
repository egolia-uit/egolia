package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type CreatePost struct {
	ID       uuid.UUID
	AuthorID string
	Title    string
	Content  string
	Tags     []string
}

type CreatePostHandler struct {
	uow domain.UnitOfWork
}

func NewCreatePostHandler(uow domain.UnitOfWork) *CreatePostHandler {
	return &CreatePostHandler{uow: uow}
}

var _ commonhandler.Cmd[CreatePost] = (*CreatePostHandler)(nil)

func (h *CreatePostHandler) Handle(ctx context.Context, cmd *CreatePost) error {
	post, err := domain.NewPost(cmd.ID, cmd.AuthorID, cmd.Title, cmd.Content, cmd.Tags)
	if err != nil {
		return err
	}
	return h.uow.Execute(ctx, func(r domain.RepoRegistry) error {
		return r.Post().Save(ctx, post)
	})
}
