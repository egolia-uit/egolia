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

type CourseStatus string

const (
	CourseStatusDraft    CourseStatus = "draft"
	CourseStatusPending  CourseStatus = "pending"
	CourseStatusApproved CourseStatus = "approved"
	CourseStatusRejected CourseStatus = "rejected"
)

type CourseLandingPageIntroduction struct {
	VideoUrl string
}

type Course struct {
	ID               uuid.UUID
	OriginalCourseID uuid.UUID
	Hidden           bool
	Title            string
	InstructorID     string
	Status           CourseStatus
	Price            int64
	Overview         string
	Introduction     CourseLandingPageIntroduction
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
	GetSectionID() uuid.UUID
	GetTitle() string
	GetLessonType() LessonType
	GetOrder() string
}

type LessonBase struct {
	ID         uuid.UUID
	SectionID  uuid.UUID
	Title      string
	LessonType LessonType
	Order      string
}

var _ Lesson = (*VideoLesson)(nil)

func (l *LessonBase) isLesson() {}

func (l *LessonBase) GetID() uuid.UUID {
	return l.ID
}

func (l *LessonBase) GetSectionID() uuid.UUID {
	return l.SectionID
}

func (l *LessonBase) GetTitle() string {
	return l.Title
}

func (l *LessonBase) GetLessonType() LessonType {
	return l.LessonType
}

func (l *LessonBase) GetOrder() string {
	return l.Order
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
	ID       uuid.UUID
	CourseID uuid.UUID
	Title    string
	Order    string
	Lessons  []Lesson
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
