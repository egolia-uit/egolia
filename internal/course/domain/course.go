package domain

import (
	"time"

	"github.com/google/uuid"
)

type CourseStatus string

const (
	CourseStatusDraft    CourseStatus = "draft"
	CourseStatusPending  CourseStatus = "pending"
	CourseStatusApproved CourseStatus = "approved"
	CourseStatusRejected CourseStatus = "rejected"
)

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
) *Course {
	return &Course{
		id:               id,
		title:            title,
		instructorID:     instructorID,
		originalCourseID: originalCourseID,
		status:           status,
		price:            price,
		overview:         overview,
		hidden:           hidden,
		introduction:     introduction,
		deletedAt:        nil,
	}
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
) *Course {
	return &Course{
		id:               id,
		originalCourseID: originalCourseID,
		title:            title,
		instructorID:     instructorID,
		status:           status,
		price:            price,
		hidden:           hidden,
		overview:         overview,
		introduction:     introduction,
		deletedAt:        deletedAt,
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
