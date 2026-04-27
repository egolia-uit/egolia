package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
)

type Registry struct{}

func (r *Registry) Bookmark() domain.BookmarkRepo { return nil }

func (r *Registry) Certificate() domain.CertificateRepo { return nil }

func (r *Registry) Course() domain.CourseRepo { return nil }

func (r *Registry) Enrollment() domain.EnrollmentRepo { return nil }

func (r *Registry) LessonComment() domain.LessonCommentRepo { return nil }

// func (r *Registry) LessonProgressTest() domain.LessonProgressTestRepo { return nil }

// func (r *Registry) LessonProgressVideo() domain.LessonProgressVideoRepo { return nil }

func (r *Registry) Review() domain.ReviewRepo { return nil }

func (r *Registry) Section() domain.SectionRepo { return nil }

func (r *Registry) TestLesson() domain.TestLessonRepo { return nil }

func (r *Registry) VideoLesson() domain.VideoLessonRepo { return nil }

type UnitOfWork struct{}

func NewUnitOfWork() *UnitOfWork {
	return &UnitOfWork{}
}

func (u *UnitOfWork) Execute(ctx context.Context, fn func(repoRegistry Registry) error) error {
	return fn(Registry{})
}
