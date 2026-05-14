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
	HasNext    bool
	HasPrev    bool
}

type Paginated[T any] struct {
	Data       []T
	Pagination Pagination
}

type SearchCoursesOrder string

const (
	SearchCoursesOrderAsc  SearchCoursesOrder = "asc"
	SearchCoursesOrderDesc SearchCoursesOrder = "desc"
)

type CourseStatus string

const (
	CourseStatusDraft    CourseStatus = "draft"
	CourseStatusPending  CourseStatus = "pending"
	CourseStatusApproved CourseStatus = "approved"
	CourseStatusRejected CourseStatus = "rejected"
)

type Course struct {
	ID                   uuid.UUID
	OriginalCourseID     uuid.UUID
	Hidden               bool
	Title                string
	InstructorID         string
	Status               CourseStatus
	Price                int64
	Overview             string
	IntroductionVideoKey *string
	IntroductionVideoURL *string
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
	GetTitle() string
	GetLessonType() LessonType
}

type LessonBase struct {
	ID         uuid.UUID
	Title      string
	LessonType LessonType
}

var _ Lesson = (*VideoLesson)(nil)

func (l *LessonBase) isLesson() {}

func (l *LessonBase) GetID() uuid.UUID {
	return l.ID
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

type QuestionType string

const (
	QuestionTypeMultipleChoice QuestionType = "multipleChoice"
	QuestionTypeSingleChoice   QuestionType = "singleChoice"
)

type TestLesson struct {
	LessonBase
	QuestionType QuestionType
	Questions    []TestQuestion
}

type CourseDetailSectionItem struct {
	ID       uuid.UUID
	CourseID uuid.UUID
	Title    string
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
	Roles  []UserRole
}

type UserRole string

const (
	UserRoleAdmin      UserRole = "admin"
	UserRoleInstructor UserRole = "instructor"
)

type VideoLessonObject struct {
	UploadURL string
	VideoKey  string
	ExpiresAt time.Time
}

type Review struct {
	ID        uuid.UUID
	CourseID  uuid.UUID
	UserID    string
	Rating    int
	Comment   string
	CreatedAt time.Time
}

type Certificate struct {
	ID        uuid.UUID
	CourseID  uuid.UUID
	UserID    string
	CreatedAt time.Time
}
