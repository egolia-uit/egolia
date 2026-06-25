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

type DeletePost struct {
	PostID     uuid.UUID
	ActorID    string
	ActorRoles []string
}

type DeletePostHandler struct {
	uow domain.UnitOfWork
}

func NewDeletePostHandler(uow domain.UnitOfWork) *DeletePostHandler {
	return &DeletePostHandler{uow: uow}
}

var _ commonhandler.Cmd[DeletePost] = (*DeletePostHandler)(nil)

func (h *DeletePostHandler) Handle(ctx context.Context, cmd *DeletePost) error {
	return h.uow.Execute(ctx, func(r domain.RepoRegistry) error {
		post, err := r.Post().Get(ctx, cmd.PostID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewPostNotFoundErr(cmd.PostID)
			}
			return err
		}
		if err := post.CanUserEdit(cmd.ActorID, cmd.ActorRoles); err != nil {
			return err
		}
		if _, err := r.Comment().DeleteByPostID(ctx, cmd.PostID); err != nil {
			return err
		}
		return r.Post().Delete(ctx, cmd.PostID)
	})
}
