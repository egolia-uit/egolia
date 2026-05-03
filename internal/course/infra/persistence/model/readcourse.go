package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

// --- JSONB content structs (what FE receives) ---

type ReadCourseAnswerContent struct {
	ID        uuid.UUID `json:"id"`
	Answer    string    `json:"answer"`
	IsCorrect bool      `json:"is_correct"`
}

type ReadCourseQuestionContent struct {
	ID           uuid.UUID                 `json:"id"`
	QuestionText string                    `json:"question_text"`
	Answers      []ReadCourseAnswerContent `json:"answers"`
}

type ReadCourseLessonContent struct {
	ID         uuid.UUID                   `json:"id"`
	Title      string                      `json:"title"`
	SortOrder  string                      `json:"sort_order"`
	LessonType string                      `json:"lesson_type"`
	VideoKey   *string                     `json:"video_key,omitempty"`
	Duration   *int64                      `json:"duration_seconds,omitempty"`
	TestType   *string                     `json:"test_type,omitempty"`
	Questions  []ReadCourseQuestionContent `json:"questions,omitempty"`
}

type ReadCourseSectionContent struct {
	ID        uuid.UUID                 `json:"id"`
	Title     string                    `json:"title"`
	SortOrder string                    `json:"sort_order"`
	Lessons   []ReadCourseLessonContent `json:"lessons"`
}

type ReadCourseContent struct {
	Title         string                     `json:"title"`
	InstructorID  string                     `json:"instructor_id"`
	Status        string                     `json:"status"`
	Price         float64                    `json:"price"`
	Overview      string                     `json:"overview"`
	IntroVideoURL string                     `json:"intro_video_url"`
	Sections      []ReadCourseSectionContent `json:"sections"`
}

// --- GORM model ---

type ReadCourse struct {
	CourseID          uuid.UUID         `gorm:"type:uuid;primaryKey;column:course_id"`
	Title             string            `gorm:"type:varchar(255);not null"`
	Price             float64           `gorm:"not null;default:0"`
	FullCourseContent ReadCourseContent `gorm:"column:full_course_content;serializer:json;type:jsonb;not null"`
	PublishedAt       *time.Time        `gorm:"column:published_at"`
}

func (ReadCourse) TableName() string { return "read_courses" }

func ReadCourseFromDomain(c *domain.Course) *ReadCourse {
	sections := make([]ReadCourseSectionContent, 0, len(c.Sections()))
	for _, s := range c.Sections() {
		sections = append(sections, buildSectionContent(s))
	}

	content := ReadCourseContent{
		Title:         c.Title(),
		InstructorID:  c.InstructorID().String(),
		Status:        string(c.Status()),
		Price:         c.Price(),
		Overview:      c.Overview(),
		IntroVideoURL: c.Introduction().VideoURL(),
		Sections:      sections,
	}

	var publishedAt *time.Time
	if c.Status() == domain.CourseStatusApproved {
		now := time.Now()
		publishedAt = &now
	}

	return &ReadCourse{
		CourseID:          c.ID(),
		Title:             c.Title(),
		Price:             c.Price(),
		FullCourseContent: content,
		PublishedAt:       publishedAt,
	}
}

func buildSectionContent(s *domain.Section) ReadCourseSectionContent {
	lessons := make([]ReadCourseLessonContent, 0, len(s.Lessons()))
	for _, l := range s.Lessons() {
		lessons = append(lessons, buildLessonContent(l))
	}
	return ReadCourseSectionContent{
		ID:        s.ID(),
		Title:     s.Title(),
		SortOrder: s.Order(),
		Lessons:   lessons,
	}
}

func buildLessonContent(l domain.Lesson) ReadCourseLessonContent {
	base := ReadCourseLessonContent{
		ID:         l.ID(),
		Title:      l.Title(),
		SortOrder:  l.Order(),
		LessonType: "",
		VideoKey:   nil,
		Duration:   nil,
		TestType:   nil,
		Questions:  nil,
	}
	switch lesson := l.(type) {
	case *domain.VideoLesson:
		key := lesson.GetVideoKey()
		dur := int64(lesson.GetDuration().Seconds())
		base.LessonType = string(domain.LessonTypeVideo)
		base.VideoKey = &key
		base.Duration = &dur
	case *domain.TestLesson:
		t := string(lesson.LessonType())
		base.LessonType = string(domain.LessonTypeTest)
		base.TestType = &t
		base.Questions = buildQuestions(lesson.GetQuestions())
	}
	return base
}

func buildQuestions(qs []*domain.TestQuestion) []ReadCourseQuestionContent {
	out := make([]ReadCourseQuestionContent, 0, len(qs))
	for _, q := range qs {
		answers := make([]ReadCourseAnswerContent, 0, len(q.Answers))
		for _, a := range q.Answers {
			answers = append(answers, ReadCourseAnswerContent{
				ID:        a.ID,
				Answer:    a.Content,
				IsCorrect: a.IsCorrect,
			})
		}
		out = append(out, ReadCourseQuestionContent{
			ID:           q.ID,
			QuestionText: q.Question,
			Answers:      answers,
		})
	}
	return out
}
