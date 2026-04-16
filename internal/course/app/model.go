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
	GetID() uuid.UUID
	GetCourseID() uuid.UUID
	GetTitle() string
	GetLessonType() LessonType
}

type LessonBase struct {
	ID         uuid.UUID
	CourseID   uuid.UUID
	Title      string
	LessonType LessonType
}

var _ Lesson = (*VideoLesson)(nil)

func (l *LessonBase) isLesson() {}

func (l *LessonBase) GetID() uuid.UUID {
	return l.ID
}

func (l *LessonBase) GetCourseID() uuid.UUID {
	return l.CourseID
}

func (l *LessonBase) GetTitle() string {
	return l.Title
}

func (l *LessonBase) GetLessonType() LessonType {
	return l.LessonType
}

type VideoLesson struct {
	LessonBase
	VideoURL string
	Duration time.Duration
}

type TestAnswer struct {
	ID        uuid.UUID
	Content   string
	IsCorrect bool
}

type TestQuestion struct {
	ID       uuid.UUID
	Question string
	Answers  []TestAnswer
}

type TestLessonType string

const (
	TestLessonTypeMultipleChoice TestLessonType = "multipleChoice"
	TestLessonTypeSingleChoice   TestLessonType = "singleChoice"
)

type TestLesson struct {
	LessonBase
	TestLessonType TestLessonType
	Questions      []TestQuestion
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
	VideoKey  string
	ExpiresAt time.Time
}
