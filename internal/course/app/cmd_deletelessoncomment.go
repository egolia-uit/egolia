package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type DeleteLessonComment struct {
	CommentID uuid.UUID
	UserID    string
	UserRoles []UserRole
}

type DeleteLessonCommentCmd Cmd[DeleteLessonComment]

type DeleteLessonCommentHandler struct {
	uow domain.UnitOfWork
}

func NewDeleteLessonCommentHandler(
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) DeleteLessonCommentCmd {
	handler := &DeleteLessonCommentHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[DeleteLessonComment] = (*DeleteLessonCommentHandler)(nil)

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
