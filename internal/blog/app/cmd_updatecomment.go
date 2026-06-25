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

type UpdateComment struct {
	CommentID  uuid.UUID
	ActorID    string
	ActorRoles []string
	Content    string
}

type UpdateCommentHandler struct {
	uow domain.UnitOfWork
}

func NewUpdateCommentHandler(uow domain.UnitOfWork) *UpdateCommentHandler {
	return &UpdateCommentHandler{uow: uow}
}

var _ commonhandler.Cmd[UpdateComment] = (*UpdateCommentHandler)(nil)

func (h *UpdateCommentHandler) Handle(ctx context.Context, cmd *UpdateComment) error {
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
		if err := comment.SetContent(cmd.Content); err != nil {
			return err
		}
		return r.Comment().Save(ctx, comment)
	})
}
