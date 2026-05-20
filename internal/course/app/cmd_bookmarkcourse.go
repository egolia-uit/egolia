package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookmarkCourse struct {
	CourseID uuid.UUID
	UserID   string
}

type BookmarkCourseHandler struct {
	uow domain.UnitOfWork
}

func NewBookmarkCourseHandler(
	uow domain.UnitOfWork,
) *BookmarkCourseHandler {
	return &BookmarkCourseHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[BookmarkCourse] = (*BookmarkCourseHandler)(nil)

// Handle executes the command to bookmark a course.
func (h *BookmarkCourseHandler) Handle(ctx context.Context, cmd *BookmarkCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
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
