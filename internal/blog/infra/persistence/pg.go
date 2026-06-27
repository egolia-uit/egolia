package persistence

import (
	"github.com/egolia-uit/egolia/internal/blog/infra/persistence/model"
	"gorm.io/gorm"
)

type PG struct {
	db *gorm.DB
}

func NewPG(db *gorm.DB) *PG {
	return &PG{db: db}
}

func (p *PG) RunMigrations() error {
	return p.db.AutoMigrate(
		//nolint:exhaustruct
		&model.Post{},
		//nolint:exhaustruct
		&model.Comment{},
	)
}
