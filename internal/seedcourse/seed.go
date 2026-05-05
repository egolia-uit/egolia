package seedcourse

import (
	"context"
	"fmt"
	"net/url"

	"gorm.io/gorm"
)

type Seed struct {
	db                     *gorm.DB
	publicObjectStorageURL *url.URL
	objectStorageBucket    string
}

func NewSeed(db *gorm.DB, cfg *Config) (*Seed, error) {
	publicObjectStorageURL, err := url.Parse(cfg.ObjectStorageBucket)
	if err != nil {
		return nil, fmt.Errorf("failed to parse public object storage URL: %w", err)
	}
	return &Seed{
		db:                     db,
		publicObjectStorageURL: publicObjectStorageURL,
		objectStorageBucket:    cfg.ObjectStorageBucket,
	}, nil
}

func (s *Seed) Run(ctx context.Context) error {
	courses := s.createCourses()
	return s.db.WithContext(ctx).
		Save(courses).
		Commit().Error
}
