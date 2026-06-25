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

type UpdatePost struct {
	PostID     uuid.UUID
	ActorID    string
	ActorRoles []string
	Title      string
	Content    string
	Tags       []string
}

type UpdatePostHandler struct {
	uow domain.UnitOfWork
}

func NewUpdatePostHandler(uow domain.UnitOfWork) *UpdatePostHandler {
	return &UpdatePostHandler{uow: uow}
}

var _ commonhandler.Cmd[UpdatePost] = (*UpdatePostHandler)(nil)

func (h *UpdatePostHandler) Handle(ctx context.Context, cmd *UpdatePost) error {
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
		if err := post.SetTitle(cmd.Title); err != nil {
			return err
		}
		if err := post.SetContent(cmd.Content); err != nil {
			return err
		}
		post.SetTags(cmd.Tags)
		return r.Post().Save(ctx, post)
	})
}
