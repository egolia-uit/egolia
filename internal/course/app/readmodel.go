package app

import (
	"context"

	"github.com/google/uuid"
)

type GetCourseReadModel interface {
	GetCourse(ctx context.Context, courseID uuid.UUID) (*Course, error)
}

type GetCourseDetailReadModel interface {
	GetCourseDetail(ctx context.Context, courseID uuid.UUID, deleted *bool) (*CourseDetail, error)

	// GetCourseDetailForUpdate is used to get course detail for update. It will return draft version of the course has this ID
	GetCourseDetailForUpdate(ctx context.Context, originalCourseID uuid.UUID, deleted *bool, status *CourseStatus) (*CourseDetail, error)
}

type GetLessonDetailReadModel interface {
	GetVideoLessonDetail(ctx context.Context, params *GetLessonDetail) (*VideoLesson, error)
	GetTestLessonDetail(ctx context.Context, params *GetLessonDetail) (*TestLesson, error)
}

type GetCourses struct {
	InstructorID       *string
	Query              *string
	Paginate           PaginationParams
	Order              *SearchCoursesOrder
	Hidden             *bool
	Status             *CourseStatus
	HaveOriginalCourse *bool
}

type GetCoursesReadModel interface {
	GetCourses(ctx context.Context, params *GetCourses) (*Paginated[Course], error)
	GetMyBookmarkedCourses(ctx context.Context, params *GetMyBookmarkedCourses) (*Paginated[Course], error)
	GetMyEnrolledCourses(ctx context.Context, params *GetMyEnrolledCourses) (*Paginated[Course], error)
	GetCourseByID(ctx context.Context, query *GetCourseLandingPage) (*Course, error)
}
