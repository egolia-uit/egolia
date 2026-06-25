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

type DeleteComment struct {
	CommentID  uuid.UUID
	ActorID    string
	ActorRoles []string
}

type DeleteCommentHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteCommentHandler(uow domain.UnitOfWork) *DeleteCommentHandler {
	return &DeleteCommentHandler{uow: uow}
}

var _ commonhandler.Cmd[DeleteComment] = (*DeleteCommentHandler)(nil)

func (h *DeleteCommentHandler) Handle(ctx context.Context, cmd *DeleteComment) error {
	return h.uow.Execute(ctx, func(r domain.RepoRegistry) error {
		comment, err := r.Comment().Get(ctx, cmd.CommentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCommentNotFoundErr(cmd.CommentID)
			}
			return err
		}
		if err := comment.CanUserEdit(cmd.ActorID, cmd.ActorRoles); err != nil {
			return err
		}
		repliesDeleted, err := r.Comment().DeleteReplies(ctx, cmd.CommentID)
		if err != nil {
			return err
		}
		if err := r.Comment().Delete(ctx, cmd.CommentID); err != nil {
			return err
		}
		post, err := r.Post().Get(ctx, comment.PostID())
		if err != nil {
			return err
		}
		post.DecrementCommentCount(repliesDeleted + 1)
		return r.Post().Save(ctx, post)
	})
}
