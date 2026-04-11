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
