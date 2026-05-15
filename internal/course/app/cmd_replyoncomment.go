package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type ReplyOnLessonComment struct {
	OriginCommentID uuid.UUID
	UserID          string
	Content         string
}

type ReplyOnLessonCommentCmd Cmd[ReplyOnLessonComment]

func NewReplyOnLessonCommentHandler(
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) ReplyOnLessonCommentCmd {
	handler := &ReplyOnLessonCommentHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

type ReplyOnLessonCommentHandler struct {
	uow domain.UnitOfWork
}

var _ Cmd[ReplyOnLessonComment] = (*ReplyOnLessonCommentHandler)(nil)

func (h *ReplyOnLessonCommentHandler) Handle(ctx context.Context, cmd *ReplyOnLessonComment) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		originComment, err := repoRegistry.LessonComment().Get(ctx, domain.LessonCommentRepoGet{
			ID: cmd.OriginCommentID,
		})
		if err != nil {
			return err
		}
		if originComment == nil {
			return errs.NewLessonCommentNotFound(cmd.OriginCommentID, nil)
		}
		replyComment := domain.NewLessonComment(uuid.New(), cmd.UserID, originComment.LessonID(), cmd.Content, &cmd.OriginCommentID)
		return repoRegistry.LessonComment().Save(ctx, replyComment)
	})
}
