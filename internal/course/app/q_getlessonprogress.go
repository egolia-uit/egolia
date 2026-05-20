package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetLessonProgress struct {
	UserID   string
	LessonID uuid.UUID
}

type GetLessonProgressHandler struct {
	uow domain.UnitOfWork
}

func NewGetLessonProgressHandler(uow domain.UnitOfWork) *GetLessonProgressHandler {
	return &GetLessonProgressHandler{
		uow: uow,
	}
}

var _ commonhandler.Query[GetLessonProgress, domain.LessonProgress] = (*GetLessonProgressHandler)(nil)

func (h *GetLessonProgressHandler) Handle(ctx context.Context, query *GetLessonProgress) (domain.LessonProgress, error) {
	var result domain.LessonProgress

	err := h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonProgress, err := repoRegistry.LessonProgress().GetByUserIDAndLesson(ctx, query.UserID, query.LessonID)
		if err != nil {
			return err
		}
		result = lessonProgress
		return nil
	})
	return result, err
}
