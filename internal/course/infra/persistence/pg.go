package persistence

import (
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
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
		&model.Bookmark{},
		//nolint:exhaustruct
		&model.Certificate{},
		//nolint:exhaustruct
		&model.Course{},
		//nolint:exhaustruct
		&model.Enrollment{},
		//nolint:exhaustruct
		&model.Lesson{},
		//nolint:exhaustruct
		&model.LessonComment{},
		//nolint:exhaustruct
		&model.ReadCourse{},
		//nolint:exhaustruct
		&model.Review{},
		//nolint:exhaustruct
		&model.Section{},
		//nolint:exhaustruct
		&model.TestAnswer{},
		//nolint:exhaustruct
		&model.TestLesson{},
		//nolint:exhaustruct
		&model.TestQuestion{},
		//nolint:exhaustruct
		&model.VideoLesson{},
	)
}
