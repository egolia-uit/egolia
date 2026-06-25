package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentOnPost struct {
	CommentID uuid.UUID
	PostID    uuid.UUID
	AuthorID  string
	Content   string
}

type CommentOnPostHandler struct {
	uow domain.UnitOfWork
}

func NewCommentOnPostHandler(uow domain.UnitOfWork) *CommentOnPostHandler {
	return &CommentOnPostHandler{uow: uow}
}

var _ commonhandler.Cmd[CommentOnPost] = (*CommentOnPostHandler)(nil)

func (h *CommentOnPostHandler) Handle(ctx context.Context, cmd *CommentOnPost) error {
	comment, err := domain.NewComment(cmd.CommentID, cmd.PostID, cmd.AuthorID, cmd.Content, nil)
	if err != nil {
		return err
	}
	return h.uow.Execute(ctx, func(r domain.RepoRegistry) error {
		post, err := r.Post().Get(ctx, cmd.PostID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewPostNotFoundErr(cmd.PostID)
			}
			return err
		}
		if err := r.Comment().Save(ctx, comment); err != nil {
			return err
		}
		post.IncrementCommentCount()
		return r.Post().Save(ctx, post)
	})
}
