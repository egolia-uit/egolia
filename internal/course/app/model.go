package app

import (
	"time"

	"github.com/google/uuid"
)

type PaginationParams struct {
	Page  int
	Limit int
}

type Pagination struct {
	Page       int
	Limit      int
	Total      int
	TotalPages int
	hasNext    bool
	hasPrev    bool
}

type Paginated[T any] struct {
	Data       []T
	Pagination Pagination
}

type Course struct {
	ID           uuid.UUID
	Title        string
	InstructorID string
	// Status???
	Price int64 // Maybe affected by db and controller out
}

type Section struct {
	ID       uuid.UUID
	CourseID uuid.UUID
	Title    string
}

type LessonType string

const (
	LessonTypeVideo LessonType = "video"
	LessonTypeTest  LessonType = "test"
)

type Lesson interface {
	isLesson()
}

type LessonBase struct {
	ID         uuid.UUID
	CourseID   uuid.UUID
	Title      string
	LessonType LessonType
}

var _ Lesson = (*VideoLesson)(nil)

func (v VideoLesson) isLesson() {}

type VideoLesson struct {
	LessonBase
	VideoURL string
	Duration time.Duration
}

type TestAnwser struct {
	ID        uuid.UUID
	Content   string
	IsCorrect bool
}

type TestQuestion struct {
	ID       uuid.UUID
	Question string
	Answers  []TestAnwser
}

type TestLesson struct {
	LessonBase
	Questions []TestQuestion
}

type CourseDetailSectionItem struct {
	LessonBase
	Sections []Section
}

type CourseDetail struct {
	Course   Course
	Sections []CourseDetailSectionItem
}

type User struct {
	ID     string
	Name   *string
	Groups []string
	Roles  []string
}

type VideoLessonObject struct {
	UploadURL string
	videoKey  string
	expiredAt int64
}
