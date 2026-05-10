package app

import (
	"context"
	"errors"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookmarkCourse struct {
	CourseID uuid.UUID
	UserID   string
}

type BookmarkCourseCmd Cmd[BookmarkCourse]

type BookmarkCourseHandler struct {
	uow domain.UnitOfWork
}

func NewBookmarkCourseHandler(
	uow domain.UnitOfWork,
	logger *slog.Logger,
	tracer Tracer,
) BookmarkCourseCmd {
	handler := &BookmarkCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[BookmarkCourse] = (*BookmarkCourseHandler)(nil)

// Handle executes the command to bookmark a course.
func (h *BookmarkCourseHandler) Handle(ctx context.Context, cmd *BookmarkCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, false)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errs.NewCourseNotFound(cmd.CourseID, err)
			}
			return err
		}
		//  check if the course is published
		if course.Status() != domain.CourseStatusApproved || course.Hidden() {
			return errs.NewCourseNotPublished(cmd.CourseID)
		}
		//  check if the bookmark already exists
		exists, err := repoRegistry.Bookmark().ExistsByUserAndCourse(ctx, cmd.UserID, cmd.CourseID)
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			exists = false
		}
		if exists {
			return repoRegistry.Bookmark().DeleteByUserAndCourse(ctx, cmd.UserID, cmd.CourseID)
		}
		bookmark := domain.NewBookmark(
			uuid.New(),
			cmd.UserID,
			course.ID(),
		)
		return repoRegistry.Bookmark().Save(ctx, bookmark)
	})

}
