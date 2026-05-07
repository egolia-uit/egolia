package seedcourse

import (
	"context"
	"fmt"
	"net/url"

	"gorm.io/gorm"
)

type Seed struct {
	db *gorm.DB
}

func NewSeed(db *gorm.DB, cfg *Config) (*Seed, error) {
	u, err := url.Parse(cfg.PublicObjectStorageURL)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return nil, fmt.Errorf("invalid public_object_storage_url %q: must be an absolute URL with scheme and host", cfg.PublicObjectStorageURL)
	}
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
