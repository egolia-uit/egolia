package repo

import (
	"context"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"gorm.io/gorm"
)

type Registry struct {
	db *gorm.DB
}

func NewRegistry(db *gorm.DB) *Registry {
	return &Registry{db: db}
}

func (r *Registry) Post() domain.PostRepo       { return &PostRepo{db: r.db} }
func (r *Registry) Comment() domain.CommentRepo { return &CommentRepo{db: r.db} }

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
