package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type ReplyOnLessonComment struct {
	OriginCommentID uuid.UUID
	UserID          string
	Content         string
}

type ReplyOnLessonCommentHandler struct {
	uow domain.UnitOfWork
}

func NewReplyOnLessonCommentHandler(
	uow domain.UnitOfWork,
) *ReplyOnLessonCommentHandler {
	return &ReplyOnLessonCommentHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[ReplyOnLessonComment] = (*ReplyOnLessonCommentHandler)(nil)

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
