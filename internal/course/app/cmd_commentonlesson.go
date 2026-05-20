package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type CommentOnLesson struct {
	LessonID uuid.UUID
	UserID   string
	Content  string
}

type CommentOnLessonHandler struct {
	uow domain.UnitOfWork
}

func NewCommentOnLessonHandler(
	uow domain.UnitOfWork,
) *CommentOnLessonHandler {
	return &CommentOnLessonHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[CommentOnLesson] = (*CommentOnLessonHandler)(nil)

func (h *CommentOnLessonHandler) Handle(ctx context.Context, cmd *CommentOnLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonComment := domain.NewLessonComment(uuid.New(), cmd.UserID, cmd.LessonID, cmd.Content, nil)
		return repoRegistry.LessonComment().Save(ctx, lessonComment)
	})
}
