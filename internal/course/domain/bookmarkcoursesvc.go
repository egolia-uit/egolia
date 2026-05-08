package domain

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type BookmarkCourseSvc struct {
	bookmarkRepo BookmarkRepo
}

func NewBookmarkCourseSvc(bookmarkRepo BookmarkRepo) *BookmarkCourseSvc {
	return &BookmarkCourseSvc{
		bookmarkRepo: bookmarkRepo,
	}
}

func (s *BookmarkCourseSvc) Handle(ctx context.Context, courseID uuid.UUID, userID string) (*Bookmark, error) {
	exists, err := s.bookmarkRepo.ExistsByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errs.NewInvalid("course is already bookmarked")
	}

	bookmarkID := uuid.New()
	bookmark := NewBookmark(bookmarkID, userID, courseID)

	return bookmark, nil
}
