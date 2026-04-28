package domain

import (
	"time"

	"github.com/google/uuid"
)

type CourseStatus string

type LessonType string

type TestLessonType string

const (
	CourseStatusDraft    CourseStatus = "draft"
	CourseStatusPending  CourseStatus = "pending"
	CourseStatusApproved CourseStatus = "approved"
	CourseStatusRejected CourseStatus = "rejected"

	LessonTypeVideo LessonType = "video"
	LessonTypeTest  LessonType = "test"

	MultipleChoice TestLessonType = "multipleChoice"
	SingleChoice   TestLessonType = "singleChoice"
)

type Lesson interface {
	isLesson()
	ID() uuid.UUID
	SectionID() uuid.UUID
	SetSectionID(sectionID uuid.UUID)
	Order() string
	SetOrder(order string)
	Title() string
	SetTitle(title string)
}

var _ Lesson = (*LessonBase)(nil)

func NewLessonBase(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	title string,
) *LessonBase {
	return &LessonBase{
		id:        id,
		sectionID: sectionID,
		order:     order,
		title:     title,
	}
}

func UnmarshalLessonBase(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	title string,
) *LessonBase {
	return &LessonBase{
		id:        id,
		sectionID: sectionID,
		order:     order,
		title:     title,
	}
}

func (l *LessonBase) isLesson() {}

func (l *LessonBase) ID() uuid.UUID {
	return l.id
}

func (l *LessonBase) SectionID() uuid.UUID {
	return l.sectionID
}

func (l *LessonBase) SetSectionID(sectionID uuid.UUID) {
	l.sectionID = sectionID
}

func (l *LessonBase) Order() string {
	return l.order
}

func (l *LessonBase) SetOrder(order string) {
	l.order = order
}

func (l *LessonBase) Title() string {
	return l.title
}

func (l *LessonBase) SetTitle(title string) {
	l.title = title
}

type LessonBase struct {
	id        uuid.UUID
	sectionID uuid.UUID
	order     string
	title     string
}

type Section struct {
	id        uuid.UUID
	courseID  uuid.UUID
	title     string
	order     string
	deletedAt *time.Time
	lessons   []Lesson
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
		lessons:   []Lesson{},
	}
}

func UnmarshalSection(
	id uuid.UUID,
	courseID uuid.UUID,
	title string,
	order string,
	deletedAt *time.Time,
	lessons []Lesson,
) *Section {
	if lessons == nil {
		lessons = []Lesson{}
	}
	return &Section{
		id:        id,
		courseID:  courseID,
		title:     title,
		order:     order,
		deletedAt: deletedAt,
		lessons:   lessons,
	}
}

func (s *Section) ID() uuid.UUID {
	return s.id
}

func (s *Section) CourseID() uuid.UUID {
	return s.courseID
}

func (s *Section) SetCourseID(courseID uuid.UUID) {
	s.courseID = courseID
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

func (s *Section) Lessons() []Lesson {
	return s.lessons
}

func (s *Section) AddLesson(lesson Lesson) {
	if lesson == nil {
		return
	}
	lesson.SetSectionID(s.id)
	s.lessons = append(s.lessons, lesson)
}

func (s *Section) RemoveLesson(lessonID uuid.UUID) {
	out := make([]Lesson, 0, len(s.lessons))
	for _, lesson := range s.lessons {
		if lesson == nil {
			continue
		}
		if lesson.ID() == lessonID {
			continue
		}
		out = append(out, lesson)
	}
	s.lessons = out
}

type TestAnswer struct {
	ID        uuid.UUID
	Content   string
	IsCorrect bool
}

func NewTestAnswer(
	id uuid.UUID,
	content string,
	isCorrect bool,
) *TestAnswer {
	return &TestAnswer{
		ID:        id,
		Content:   content,
		IsCorrect: isCorrect,
	}
}

type TestQuestion struct {
	ID       uuid.UUID
	Question string
	Answers  []*TestAnswer
}

func NewTestQuestion(
	id uuid.UUID,
	question string,
	answers []*TestAnswer,
) *TestQuestion {
	return &TestQuestion{
		ID:       id,
		Question: question,
		Answers:  answers,
	}
}

type TestLesson struct {
	LessonBase
	Type      TestLessonType
	Questions []*TestQuestion
}

var _ Lesson = (*TestLesson)(nil)

func NewTestLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	title string,
	lessonType TestLessonType,
	questions []*TestQuestion,
) *TestLesson {
	return &TestLesson{
		LessonBase: *NewLessonBase(id, sectionID, order, title),
		Type:       lessonType,
		Questions:  questions,
	}
}

func UnmarshalTestLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	title string,
	lessonType TestLessonType,
	questions []*TestQuestion,
) *TestLesson {
	return &TestLesson{
		LessonBase: *UnmarshalLessonBase(id, sectionID, order, title),
		Type:       lessonType,
		Questions:  questions,
	}
}

func (tl *TestLesson) LessonType() TestLessonType {
	return tl.Type
}

func (tl *TestLesson) GetQuestions() []*TestQuestion {
	return tl.Questions
}

func (tl *TestLesson) SetQuestions(questions []*TestQuestion) {
	tl.Questions = questions
}

type VideoLesson struct {
	LessonBase
	VideoKey string
	Duration time.Duration
}

var _ Lesson = (*VideoLesson)(nil)

func NewVideoLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	title string,
	videoKey string,
	duration time.Duration,
) *VideoLesson {
	return &VideoLesson{
		LessonBase: *NewLessonBase(id, sectionID, order, title),
		VideoKey:   videoKey,
		Duration:   duration,
	}
}

func UnmarshalVideoLesson(
	id uuid.UUID,
	sectionID uuid.UUID,
	order string,
	title string,
	videoURL string,
	duration time.Duration,
) *VideoLesson {
	return &VideoLesson{
		LessonBase: *UnmarshalLessonBase(id, sectionID, order, title),
		VideoKey:   videoURL,
		Duration:   duration,
	}
}

func (vl *VideoLesson) GetVideoKey() string {
	return vl.VideoKey
}

func (vl *VideoLesson) SetVideoKey(videoKey string) {
	vl.VideoKey = videoKey
}

func (vl *VideoLesson) GetDuration() time.Duration {
	return vl.Duration
}

func (vl *VideoLesson) SetDuration(duration time.Duration) {
	vl.Duration = duration
}

type Course struct {
	id               uuid.UUID
	originalCourseID uuid.UUID
	hidden           bool
	title            string
	instructorID     uuid.UUID
	status           CourseStatus
	price            float64
	overview         string
	introduction     CourseLandingPageIntroduction
	deletedAt        *time.Time
	sections         []*Section
}

type CourseLandingPageIntroduction struct {
	videoURL string
}

func NewCourse(
	id uuid.UUID,
	title string,
	originalCourseID uuid.UUID,
	instructorID uuid.UUID,
	status CourseStatus,
	price float64,
	overview string,
	hidden bool,
	introduction CourseLandingPageIntroduction,
	sections []*Section,
) *Course {
	if sections == nil {
		sections = []*Section{}
	}

	c := &Course{
		id:               id,
		originalCourseID: originalCourseID,
		hidden:           hidden,
		title:            title,
		instructorID:     instructorID,
		status:           status,
		price:            price,
		overview:         overview,
		introduction:     introduction,
		deletedAt:        nil,
		sections:         sections,
	}

	for _, s := range c.sections {
		if s == nil {
			continue
		}
		s.courseID = c.id
		if s.lessons == nil {
			s.lessons = []Lesson{}
		}
		for _, l := range s.lessons {
			if l == nil {
				continue
			}
			l.SetSectionID(s.id)
		}
	}

	return c
}

func UnmarshalCourse(
	id uuid.UUID,
	originalCourseID uuid.UUID,
	title string,
	instructorID uuid.UUID,
	status CourseStatus,
	price float64,
	overview string,
	hidden bool,
	introduction CourseLandingPageIntroduction,
	deletedAt *time.Time,
	sections []*Section,
) *Course {
	if sections == nil {
		sections = []*Section{}
	}

	c := &Course{
		id:               id,
		originalCourseID: originalCourseID,
		hidden:           hidden,
		title:            title,
		instructorID:     instructorID,
		status:           status,
		price:            price,
		overview:         overview,
		introduction:     introduction,
		deletedAt:        deletedAt,
		sections:         sections,
	}

	for _, s := range c.sections {
		if s == nil {
			continue
		}
		s.courseID = c.id
		if s.lessons == nil {
			s.lessons = []Lesson{}
		}
		for _, l := range s.lessons {
			if l == nil {
				continue
			}
			l.SetSectionID(s.id)
		}
	}

	return c
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

func (c *Course) Overview() string {
	return c.overview
}

func (c *Course) SetOverview(overview string) {
	c.overview = overview
}

func (c *Course) Introduction() CourseLandingPageIntroduction {
	return c.introduction
}

func (c *Course) SetIntroduction(introduction CourseLandingPageIntroduction) {
	c.introduction = introduction
}

func (c *Course) Sections() []*Section {
	return c.sections
}

func (c *Course) AddSection(section *Section) {
	if section == nil {
		return
	}
	section.courseID = c.id
	if section.lessons == nil {
		section.lessons = []Lesson{}
	}
	c.sections = append(c.sections, section)
}

func (c *Course) RemoveSection(sectionID uuid.UUID) {
	out := make([]*Section, 0, len(c.sections))
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		if section.id == sectionID {
			continue
		}
		out = append(out, section)
	}
	c.sections = out
}

func (c *Course) GetSection(sectionID uuid.UUID) *Section {
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		if section.id == sectionID {
			return section
		}
	}
	return nil
}

func (c *Course) GetLesson(lessonID uuid.UUID) Lesson {
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		for _, lesson := range section.lessons {
			if lesson == nil {
				continue
			}
			if lesson.ID() == lessonID {
				return lesson
			}
		}
	}
	return nil
}

func NewCourseLandingPageIntroduction(videoURL string) CourseLandingPageIntroduction {
	return CourseLandingPageIntroduction{
		videoURL: videoURL,
	}
}

func (i CourseLandingPageIntroduction) VideoURL() string {
	return i.videoURL
}

func (c *Course) DeletedAt() *time.Time {
	return c.deletedAt
}

func (c *Course) Delete() {
	c.deletedAt = new(time.Time)
	*c.deletedAt = time.Now()
}
