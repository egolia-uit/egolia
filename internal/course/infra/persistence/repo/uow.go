package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"gorm.io/gorm"
)

// Registry holds a *gorm.DB (root or tx). Inside UnitOfWork.Execute the db is
// already the GORM transaction, so all repo methods share the same tx.
type Registry struct {
	db               *gorm.DB
	objectStorageSvc app.ObjectStorageSvc
}

func NewRegistry(db *gorm.DB, objectStorageSvc app.ObjectStorageSvc) *Registry {
	return &Registry{db: db, objectStorageSvc: objectStorageSvc}
}

func (r *Registry) Course() domain.CourseRepo {
	return &CourseRepo{db: r.db, objectStorageSvc: r.objectStorageSvc}
}
func (r *Registry) Enrollment() domain.EnrollmentRepo       { return &EnrollmentRepo{db: r.db} }
func (r *Registry) Bookmark() domain.BookmarkRepo           { return &BookmarkRepo{db: r.db} }
func (r *Registry) Certificate() domain.CertificateRepo     { return &CertificateRepo{db: r.db} }
func (r *Registry) LessonComment() domain.LessonCommentRepo { return &LessonCommentRepo{db: r.db} }
func (r *Registry) Review() domain.ReviewRepo               { return &ReviewRepo{db: r.db} }

// UnitOfWork opens a Postgres transaction and passes a Registry backed by
// that tx to fn, keeping all repo operations atomic.
type UnitOfWork struct {
	db               *gorm.DB
	objectStorageSvc app.ObjectStorageSvc
}

var _ domain.UnitOfWork = (*UnitOfWork)(nil)

func NewUnitOfWork(db *gorm.DB, objectStorageSvc app.ObjectStorageSvc) *UnitOfWork {
	return &UnitOfWork{db: db, objectStorageSvc: objectStorageSvc}
}

func (u *UnitOfWork) Execute(ctx context.Context, fn func(domain.RepoRegistry) error) error {
	return u.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(NewRegistry(tx, u.objectStorageSvc))
	})
}
