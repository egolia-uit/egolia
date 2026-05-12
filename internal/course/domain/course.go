package domain

import (
	"strings"
	"time"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type CourseStatus string

type LessonType string

type QuestionType string

const (
	CourseStatusDraft    CourseStatus = "draft"
	CourseStatusPending  CourseStatus = "pending"
	CourseStatusApproved CourseStatus = "approved"
	CourseStatusRejected CourseStatus = "rejected"

	LessonTypeVideo LessonType = "video"
	LessonTypeTest  LessonType = "test"

	QuestionTypeMultipleChoice QuestionType = "multipleChoice"
	QuestionTypeSingleChoice   QuestionType = "singleChoice"
)

type Lesson interface {
	isLesson()
	ID() uuid.UUID
	Title() string
	SetTitle(title string)
}

type LessonBase struct {
	id    uuid.UUID
	title string
}

var _ Lesson = (*LessonBase)(nil)

func NewLessonBase(
	id uuid.UUID,
	title string,
) *LessonBase {
	return &LessonBase{
		id:    id,
		title: title,
	}
}

func UnmarshalLessonBase(
	id uuid.UUID,
	title string,
) *LessonBase {
	return &LessonBase{
		id:    id,
		title: title,
	}
}

func (l *LessonBase) isLesson() {}

func (l *LessonBase) ID() uuid.UUID {
	return l.id
}

func (l *LessonBase) Title() string {
	return l.title
}

func (l *LessonBase) SetTitle(title string) {
	l.title = title
}

type Section struct {
	id        uuid.UUID
	title     string
	deletedAt *time.Time
	lessons   []Lesson
}

func NewSection(
	id uuid.UUID,
	title string,
) *Section {
	return &Section{
		id:        id,
		title:     title,
		deletedAt: nil,
		lessons:   []Lesson{},
	}
}

func UnmarshalSection(
	id uuid.UUID,
	title string,
	deletedAt *time.Time,
	lessons []Lesson,
) *Section {
	if lessons == nil {
		lessons = []Lesson{}
	}
	return &Section{
		id:        id,
		title:     title,
		deletedAt: deletedAt,
		lessons:   lessons,
	}
}

func (s *Section) ID() uuid.UUID {
	return s.id
}

func (s *Section) Title() string {
	return s.title
}

func (s *Section) SetTitle(title string) {
	s.title = title
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
	questionType QuestionType
	questions    []*TestQuestion
}

var _ Lesson = (*TestLesson)(nil)

func NewTestLesson(
	id uuid.UUID,
	title string,
	questionType QuestionType,
	questions []*TestQuestion,
) *TestLesson {
	return &TestLesson{
		LessonBase:   *NewLessonBase(id, title),
		questionType: questionType,
		questions:    questions,
	}
}

func UnmarshalTestLesson(
	id uuid.UUID,
	title string,
	questionType QuestionType,
	questions []*TestQuestion,
) *TestLesson {
	return &TestLesson{
		LessonBase:   *UnmarshalLessonBase(id, title),
		questionType: questionType,
		questions:    questions,
	}
}

func (tl *TestLesson) GetQuestions() []*TestQuestion {
	return tl.questions
}

func (tl *TestLesson) SetQuestions(questions []*TestQuestion) {
	tl.questions = questions
}

func (tl *TestLesson) QuestionType() QuestionType {
	return tl.questionType
}

type VideoLesson struct {
	LessonBase
	VideoKey string
	Duration time.Duration
}

var _ Lesson = (*VideoLesson)(nil)

func NewVideoLesson(
	id uuid.UUID,
	title string,
	videoKey string,
	duration time.Duration,
) *VideoLesson {
	return &VideoLesson{
		LessonBase: *NewLessonBase(id, title),
		VideoKey:   videoKey,
		Duration:   duration,
	}
}

func UnmarshalVideoLesson(
	id uuid.UUID,
	title string,
	videoKey string,
	duration time.Duration,
) *VideoLesson {
	return &VideoLesson{
		LessonBase: *UnmarshalLessonBase(id, title),
		VideoKey:   videoKey,
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
	id                   uuid.UUID
	originalCourseID     uuid.UUID
	hidden               bool
	title                string
	instructorID         string
	status               CourseStatus
	price                int64
	overview             string
	introductionVideoKey string
	deletedAt            *time.Time
	sections             []*Section
}

func NewCourse(
	id uuid.UUID,
	title string,
	instructorID string,
	price int64,
	overview string,
	introductionVideoKey string,
) (*Course, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return nil, errs.NewInvalid("title is required")
	}
	if price < 0 {
		return nil, errs.NewInvalid("price must be greater than or equal to 0")
	}

	c := &Course{
		id:                   id,
		originalCourseID:     uuid.Nil,
		hidden:               false,
		title:                title,
		instructorID:         instructorID,
		status:               CourseStatusDraft,
		price:                price,
		overview:             overview,
		introductionVideoKey: introductionVideoKey,
		deletedAt:            nil,
		sections:             []*Section{},
	}

	return c, nil
}

func UnmarshalCourse(
	id uuid.UUID,
	originalCourseID uuid.UUID,
	title string,
	instructorID string,
	status CourseStatus,
	price int64,
	overview string,
	hidden bool,
	introductionVideoKey string,
	deletedAt *time.Time,
	sections []*Section,
) *Course {
	if sections == nil {
		sections = []*Section{}
	}

	return &Course{
		id:                   id,
		originalCourseID:     originalCourseID,
		hidden:               hidden,
		title:                title,
		instructorID:         instructorID,
		status:               status,
		price:                price,
		overview:             overview,
		introductionVideoKey: introductionVideoKey,
		deletedAt:            deletedAt,
		sections:             sections,
	}
}

func (c *Course) ID() uuid.UUID {
	return c.id
}

func (c *Course) OriginalCourseID() uuid.UUID {
	return c.originalCourseID
}

func (c *Course) Hidden() bool {
	return c.hidden
}

func (c *Course) ToggleHidden() {
	c.hidden = !c.hidden
}

func (c *Course) DeleteSection(sectionID uuid.UUID) {
	out := make([]*Section, 0, len(c.sections))
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		if section.id == sectionID {
			section.Delete()
			out = append(out, section)
			continue
		}
		out = append(out, section)
	}
	c.sections = out
}

// func (c *Course) e(by *Course) {

func (c *Course) Title() string {
	return c.title
}

func (c *Course) SetTitle(title string) error {
	title = strings.TrimSpace(title)
	if title == "" {
		return errs.NewInvalid("title is required")
	}

	c.title = title
	return nil
}

func (c *Course) IsPublic() bool {
	return c.status == CourseStatusApproved && !c.hidden
}

func (c *Course) InstructorID() string {
	return c.instructorID
}

func (c *Course) Status() CourseStatus {
	return c.status
}

func (c *Course) SetStatus(status CourseStatus) {
	c.status = status
}

func (c *Course) Price() int64 {
	return c.price
}

func (c *Course) ExistsSectionWithTitle(title string) bool {
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		if section.Title() == title {
			return true
		}
	}
	return false
}

func (c *Course) MoveSection(sectionID uuid.UUID, newOrder int) {
	var targetSection *Section
	sections := make([]*Section, 0, len(c.sections))
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		if section.ID() == sectionID {
			targetSection = section
			continue
		}
		sections = append(sections, section)
	}

	if targetSection == nil {
		return
	}

	if newOrder < 0 || newOrder > len(sections) {
		return
	}

	out := make([]*Section, 0, len(c.sections))
	out = append(out, sections[:newOrder]...)
	out = append(out, targetSection)
	out = append(out, sections[newOrder:]...)
	c.sections = out
}

func (c *Course) MoveLesson(lessonID uuid.UUID, newSectionID uuid.UUID, newOrder int) {
	var targetLesson Lesson
	var currentSection *Section
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		for _, lesson := range section.Lessons() {
			if lesson == nil {
				continue
			}
			if lesson.ID() == lessonID {
				targetLesson = lesson
				currentSection = section
				break
			}
		}
	}

	if targetLesson == nil || currentSection == nil {
		return
	}

	currentSection.RemoveLesson(lessonID)

	var newSection *Section
	for _, section := range c.sections {
		if section == nil {
			continue
		}
		if section.ID() == newSectionID {
			newSection = section
			break
		}
	}

	if newSection == nil {
		return
	}

	if newOrder < 0 {
		newOrder = 0
	}
	if newOrder > len(newSection.lessons) {
		newOrder = len(newSection.lessons)
	}

	out := make([]Lesson, 0, len(newSection.lessons)+1)
	out = append(out, newSection.lessons[:newOrder]...)
	out = append(out, targetLesson)
	out = append(out, newSection.lessons[newOrder:]...)
	newSection.lessons = out
}

func (c *Course) CanInstructorEdit() bool {
	return c.status == CourseStatusDraft && c.deletedAt == nil
}

func (c *Course) SetPrice(price int64) error {
	if price < 0 {
		return errs.NewInvalid("price must be greater than or equal to 0")
	}
	c.price = price
	return nil
}

func (c *Course) Overview() string {
	return c.overview
}

func (c *Course) SetOverview(overview string) error {
	c.overview = strings.TrimSpace(overview)
	return nil
}

func (c *Course) IntroductionVideoKey() string {
	return c.introductionVideoKey
}

func (c *Course) SetIntroductionVideoKey(introductionVideoKey string) error {
	introductionVideoKey = strings.TrimSpace(introductionVideoKey)
	if introductionVideoKey == "" {
		return errs.NewInvalid("introduction video key is required")
	}
	c.introductionVideoKey = introductionVideoKey
	return nil
}

func (c *Course) Sections() []*Section {
	return c.sections
}

func (c *Course) AddSection(section *Section) {
	if section == nil {
		return
	}
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

func (c *Course) DeletedAt() *time.Time {
	return c.deletedAt
}

func (c *Course) Delete() {
	c.deletedAt = new(time.Time)
	*c.deletedAt = time.Now()
}
