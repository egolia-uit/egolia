package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type CommentOnLesson struct {
	LessonID uuid.UUID
	UserID   string
	Content  string
}

type CommentOnLessonCmd Cmd[CommentOnLesson]

type CommentOnLessonHandler struct {
	uow domain.UnitOfWork
}

func NewCommentOnLessonHandler(
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) CommentOnLessonCmd {
	handler := &CommentOnLessonHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[CommentOnLesson] = (*CommentOnLessonHandler)(nil)

func (h *CommentOnLessonHandler) Handle(ctx context.Context, cmd *CommentOnLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonComment := domain.NewLessonComment(uuid.New(), cmd.UserID, cmd.LessonID, cmd.Content, nil)
		return repoRegistry.LessonComment().Save(ctx, lessonComment)
	})
}
