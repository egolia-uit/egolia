package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"gorm.io/gorm"
)

// Registry holds a *gorm.DB (root or tx). Inside UnitOfWork.Execute the db is
// already the GORM transaction, so all repo methods share the same tx.
type Registry struct {
	db *gorm.DB
}

func NewRegistry(db *gorm.DB) *Registry {
	return &Registry{db: db}
}

func (r *Registry) Course() domain.CourseRepo               { return &courseRepo{db: r.db} }
func (r *Registry) Enrollment() domain.EnrollmentRepo       { return &enrollmentRepo{db: r.db} }
func (r *Registry) Bookmark() domain.BookmarkRepo           { return &bookmarkRepo{db: r.db} }
func (r *Registry) Certificate() domain.CertificateRepo     { return &certificateRepo{db: r.db} }
func (r *Registry) LessonComment() domain.LessonCommentRepo { return &lessonCommentRepo{db: r.db} }
func (r *Registry) Review() domain.ReviewRepo               { return &reviewRepo{db: r.db} }

// UnitOfWork opens a Postgres transaction and passes a Registry backed by
// that tx to fn, keeping all repo operations atomic.
type UnitOfWork struct {
	db *gorm.DB
}

func NewUnitOfWork(db *gorm.DB) *UnitOfWork {
	return &UnitOfWork{db: db}
}

func (u *UnitOfWork) Execute(ctx context.Context, fn func(domain.RepoRegistry) error) error {
	return u.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(&Registry{db: tx})
	})
}
