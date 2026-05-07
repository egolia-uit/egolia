package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Section struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
	CourseID  uuid.UUID      `gorm:"type:uuid;not null"`
	Title     string         `gorm:"type:varchar(255);not null"`
	Index     int            `gorm:"column:index;type:integer;not null;default:0"`
	Lessons   []Lesson       `gorm:"foreignKey:SectionID"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (Section) TableName() string { return "sections" }

func SectionFromDomain(index int, s *domain.Section) *Section {
	var deletedAt gorm.DeletedAt
	if s.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *s.DeletedAt(), Valid: true}
	}

	lessons := make([]Lesson, 0, len(s.Lessons()))
	for i, l := range s.Lessons() {
		if lm := LessonFromDomain(i, l, s.ID()); lm != nil {
			lessons = append(lessons, *lm)
		}
	}

	return &Section{
		ID:        s.ID(),
		CourseID:  s.CourseID(),
		Title:     s.Title(),
		Index:     index,
		Lessons:   lessons,
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
		DeletedAt: deletedAt,
	}
}

func (m *Section) ToDomain() *domain.Section {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	lessons := make([]domain.Lesson, 0, len(m.Lessons))
	for i := range m.Lessons {
		if l := m.Lessons[i].ToDomain(); l != nil {
			lessons = append(lessons, l)
		}
	}
	return domain.UnmarshalSection(m.ID, m.CourseID, m.Title, deletedAt, lessons)
}
