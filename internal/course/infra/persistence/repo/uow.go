package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"gorm.io/gorm"
)

type Registry struct {
	db *gorm.DB
}

func NewRegistry(db *gorm.DB) *Registry {
	return &Registry{db: db}
}

func (r *Registry) Course() domain.CourseRepo                 { return &CourseRepo{db: r.db} }
func (r *Registry) Enrollment() domain.EnrollmentRepo         { return &EnrollmentRepo{db: r.db} }
func (r *Registry) Bookmark() domain.BookmarkRepo             { return &BookmarkRepo{db: r.db} }
func (r *Registry) Certificate() domain.CertificateRepo       { return &CertificateRepo{db: r.db} }
func (r *Registry) LessonComment() domain.LessonCommentRepo   { return &LessonCommentRepo{db: r.db} }
func (r *Registry) Review() domain.ReviewRepo                 { return &ReviewRepo{db: r.db} }
func (r *Registry) LessonProgress() domain.LessonProgressRepo { return &LessonProgressRepo{db: r.db} }

// CourseProgress implements [domain.RepoRegistry].
func (r *Registry) CourseProgress() domain.CourseProgressRepo {
	panic("unimplemented")
}

// UnitOfWork opens a Postgres transaction and passes a Registry backed by
// that tx to fn, keeping all repo operations atomic.
type UnitOfWork struct {
	db *gorm.DB
}

var _ domain.UnitOfWork = (*UnitOfWork)(nil)

func NewUnitOfWork(db *gorm.DB) *UnitOfWork {
	return &UnitOfWork{db: db}
}

func (u *UnitOfWork) Execute(ctx context.Context, fn func(domain.RepoRegistry) error) error {
	return u.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(NewRegistry(tx))
	})
}
