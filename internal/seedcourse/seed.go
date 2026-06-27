package seedcourse

import (
	"context"
	"os"

	"gorm.io/gorm"
)

type Seed struct {
	db *gorm.DB
}

func NewSeed(db *gorm.DB) (*Seed, error) {
	return &Seed{db: db}, nil
}

func (s *Seed) Run(ctx context.Context) error {
	s.PrintSQL(os.Stdout)

	courses := s.createCourses()
	enrollments := s.createEnrollments()
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		tx.Session(&gorm.Session{FullSaveAssociations: true}).Save(courses)
		tx.Save(enrollments)
		return nil
	})
}
