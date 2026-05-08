package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Course struct {
	ID                   uuid.UUID           `gorm:"type:uuid;primaryKey"`
	OriginalCourseID     uuid.UUID           `gorm:"type:uuid;not null"`
	Title                string              `gorm:"type:text;not null"`
	InstructorID         string              `gorm:"column:instructor_id;type:text;not null"`
	Status               domain.CourseStatus `gorm:"type:text;not null"`
	Price                float64             `gorm:"not null;default:0"`
	Overview             string              `gorm:"type:text;not null;default:''"`
	Hidden               bool                `gorm:"not null;default:false"`
	IntroductionVideoKey string              `gorm:"column:introduction_video_key;type:text;not null;default:''"`
	Sections             []Section           `gorm:"foreignKey:CourseID"`
	CreatedAt            time.Time           `gorm:"autoCreateTime"`
	UpdatedAt            time.Time           `gorm:"autoUpdateTime"`
	DeletedAt            gorm.DeletedAt      `gorm:"index"`
}

func (Course) TableName() string { return "courses" }

func CourseFromDomain(c *domain.Course) *Course {
	var deletedAt gorm.DeletedAt
	if c.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *c.DeletedAt(), Valid: true}
	}

	sections := make([]Section, 0, len(c.Sections()))
	for i, s := range c.Sections() {
		sections = append(sections, *SectionFromDomain(i, s))
	}

	return &Course{
		ID:                   c.ID(),
		OriginalCourseID:     c.OriginalCourseID(),
		Title:                c.Title(),
		InstructorID:         c.InstructorID(),
		Status:               c.Status(),
		Price:                c.Price(),
		Overview:             c.Overview(),
		Hidden:               c.Hidden(),
		IntroductionVideoKey: c.IntroductionVideoKey(),
		Sections:             sections,
		CreatedAt:            time.Time{},
		UpdatedAt:            time.Time{},
		DeletedAt:            deletedAt,
	}
}

func (m *Course) ToDomain() *domain.Course {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	instructorID := m.InstructorID
	sections := make([]*domain.Section, 0, len(m.Sections))
	for i := range m.Sections {
		sections = append(sections, m.Sections[i].ToDomain())
	}

	return domain.UnmarshalCourse(
		m.ID,
		m.OriginalCourseID,
		m.Title,
		instructorID,
		m.Status,
		m.Price,
		m.Overview,
		m.Hidden,
		m.IntroductionVideoKey,
		deletedAt,
		sections,
	)
}
