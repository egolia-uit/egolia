package domain

import (
	"time"

	"github.com/google/uuid"
)

type CourseStatus string

const (
	CourseStatusDraft     CourseStatus = "draft"
	CourseStatusPublished CourseStatus = "published"
)

type Course struct {
	id           uuid.UUID
	title        string
	instructorID uuid.UUID
	// TODO: another status here
	status    CourseStatus
	price     float64
	deletedAt *time.Time
}

func NewCourse(
	id uuid.UUID,
	title string,
	instructorID uuid.UUID,
	status CourseStatus,
	price float64,
) *Course {
	return &Course{
		id:           id,
		title:        title,
		instructorID: instructorID,
		status:       status,
		price:        price,
		deletedAt:    nil,
	}
}

func UnmarshalCourse(
	id uuid.UUID,
	title string,
	instructorID uuid.UUID,
	status CourseStatus,
	price float64,
	deletedAt *time.Time,
) *Course {
	return &Course{
		id:           id,
		title:        title,
		instructorID: instructorID,
		status:       status,
		price:        price,
		deletedAt:    deletedAt,
	}
}

func (c *Course) ID() uuid.UUID {
	return c.id
}

func (c *Course) Title() string {
	return c.title
}

func (c *Course) SetTitle(title string) {
	c.title = title
}

func (c *Course) InstructorID() uuid.UUID {
	return c.instructorID
}

func (c *Course) Status() CourseStatus {
	return c.status
}

func (c *Course) SetStatus(status CourseStatus) {
	c.status = status
}

func (c *Course) Price() float64 {
	return c.price
}

func (c *Course) SetPrice(price float64) {
	c.price = price
}

func (c *Course) DeletedAt() *time.Time {
	return c.deletedAt
}

func (c *Course) Delete() {
	c.deletedAt = new(time.Time)
	*c.deletedAt = time.Now()
}
