package seedcourse

import (
	"context"

	"gorm.io/gorm"
)

type Seed struct {
	db *gorm.DB
}

func NewSeed(db *gorm.DB) (*Seed, error) {
	return &Seed{db: db}, nil
}

func (s *Seed) Run(ctx context.Context) error {
	courses := s.createCourses()
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		tx.Session(&gorm.Session{FullSaveAssociations: true}).
			Save(courses)
		return nil
	})
}
