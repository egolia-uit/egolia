package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type GetCourseProgress struct {
	CourseID uuid.UUID
	UserID   string
}

type GetCourseProgressHandler struct {
	uow domain.UnitOfWork
}

func NewGetCourseProgressHandler(uow domain.UnitOfWork) *GetCourseProgressHandler {
	return &GetCourseProgressHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[GetCourseProgress] = (*GetCourseProgressHandler)(nil)

func (h *GetCourseProgressHandler) Handle(ctx context.Context, cmd *GetCourseProgress) error {
	// return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
	// 	course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, false)
	// 	if err != nil {
	// 		return err
	// 	}

	// 	progress,err := repoRegistry.CourseProgress().Get(ctx,)
	// })
	return nil
}
