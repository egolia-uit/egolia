package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type DeleteLessonComment struct {
	CommentID uuid.UUID
	UserID    string
	UserRoles []UserRole
}

type DeleteLessonCommentHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteLessonCommentHandler(
	uow domain.UnitOfWork,
) *DeleteLessonCommentHandler {
	return &DeleteLessonCommentHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[DeleteLessonComment] = (*DeleteLessonCommentHandler)(nil)

func (h *DeleteLessonCommentHandler) Handle(ctx context.Context, cmd *DeleteLessonComment) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		comment, err := repoRegistry.LessonComment().Get(ctx, domain.LessonCommentRepoGet{
			ID: cmd.CommentID,
		})
		if err != nil {
			return err
		}
		if comment == nil {
			return errs.NewLessonCommentNotFound(cmd.CommentID, nil)
		}
		err = comment.CanUserEdit(cmd.UserID)
		if err != nil {
			return err
		}
		comment.Delete()
		err = repoRegistry.LessonComment().DeleteReplies(ctx, cmd.CommentID)
		if err != nil {
			return err
		}
		return repoRegistry.LessonComment().Save(ctx, comment)
	})
}
