package model

import (
	"sort"
	"strconv"
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Section struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey"`
	CourseID  uuid.UUID      `gorm:"type:uuid;not null"`
	Title     string         `gorm:"type:varchar(255);not null"`
	SortOrder int            `gorm:"column:sort_order;type:integer;not null;default:0"`
	Lessons   []Lesson       `gorm:"foreignKey:SectionID"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (Section) TableName() string { return "sections" }

func SectionFromDomain(s *domain.Section) *Section {
	var deletedAt gorm.DeletedAt
	if s.DeletedAt() != nil {
		deletedAt = gorm.DeletedAt{Time: *s.DeletedAt(), Valid: true}
	}

	lessons := make([]Lesson, 0, len(s.Lessons()))
	for _, l := range s.Lessons() {
		if lm := LessonFromDomain(l, s.ID()); lm != nil {
			lessons = append(lessons, *lm)
		}
	}

	return &Section{
		ID:        s.ID(),
		CourseID:  s.CourseID(),
		Title:     s.Title(),
		SortOrder: func() int { n, _ := strconv.Atoi(s.Order()); return n }(),
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
	sort.Slice(lessons, func(i, j int) bool {
		return lessons[i].Order() < lessons[j].Order()
	})

	return domain.UnmarshalSection(m.ID, m.CourseID, m.Title, strconv.Itoa(m.SortOrder), deletedAt, lessons)
}
