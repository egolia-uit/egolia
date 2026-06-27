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

type ReplyComment struct {
	CommentID       uuid.UUID
	ParentCommentID uuid.UUID
	AuthorID        string
	Content         string
}

type ReplyCommentHandler struct {
	uow domain.UnitOfWork
}

func NewReplyCommentHandler(uow domain.UnitOfWork) *ReplyCommentHandler {
	return &ReplyCommentHandler{uow: uow}
}

var _ commonhandler.Cmd[ReplyComment] = (*ReplyCommentHandler)(nil)

func (h *ReplyCommentHandler) Handle(ctx context.Context, cmd *ReplyComment) error {
	return h.uow.Execute(ctx, func(r domain.RepoRegistry) error {
		parent, err := r.Comment().Get(ctx, cmd.ParentCommentID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCommentNotFoundErr(cmd.ParentCommentID)
			}
			return err
		}
		reply, err := domain.NewComment(cmd.CommentID, parent.PostID(), cmd.AuthorID, cmd.Content, &cmd.ParentCommentID)
		if err != nil {
			return err
		}
		if err := r.Comment().Save(ctx, reply); err != nil {
			return err
		}
		post, err := r.Post().Get(ctx, parent.PostID())
		if err != nil {
			return err
		}
		post.IncrementCommentCount()
		return r.Post().Save(ctx, post)
	})
}
