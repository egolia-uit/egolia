package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"gorm.io/gorm"
)

// Registry holds the root *gorm.DB. Repos created from it call txOrDB(ctx, db)
// which uses the tx from context if present, or falls back to db.WithContext(ctx).
// When Registry is created with a tx (inside UnitOfWork.Execute), the fallback
// itself is the tx, so the transaction is always honoured.
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
// that tx to fn. Each repo method receives the caller's ctx and resolves
// to tx.WithContext(ctx) via txOrDB, keeping the operation in the transaction.
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
