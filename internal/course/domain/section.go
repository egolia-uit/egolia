package domain

import (
	"time"

	"github.com/google/uuid"
)

type Section struct {
	id        uuid.UUID
	courseID  uuid.UUID
	title     string
	order     string
	deletedAt *time.Time
}

func NewSection(
	id uuid.UUID,
	courseID uuid.UUID,
	title string,
	order string,
) *Section {
	return &Section{
		id:        id,
		courseID:  courseID,
		title:     title,
		order:     order,
		deletedAt: nil,
	}
}

func UnmarshalSection(
	id uuid.UUID,
	courseID uuid.UUID,
	title string,
	order string,
	deletedAt *time.Time,
) *Section {
	return &Section{
		id:        id,
		courseID:  courseID,
		title:     title,
		order:     order,
		deletedAt: deletedAt,
	}
}

func (s *Section) ID() uuid.UUID {
	return s.id
}

func (s *Section) CourseID() uuid.UUID {
	return s.courseID
}

func (s *Section) Title() string {
	return s.title
}

func (s *Section) SetTitle(title string) {
	s.title = title
}

func (s *Section) Order() string {
	return s.order
}

func (s *Section) SetOrder(order string) {
	s.order = order
}

func (s *Section) DeletedAt() *time.Time {
	return s.deletedAt
}

func (s *Section) Delete() {
	s.deletedAt = new(time.Time)
	*s.deletedAt = time.Now()
}
