package app

import (
	"context"
)

type GetCourseReadModel interface {
	GetCourse(ctx context.Context, courseID string) (*Course, error)
}

type GetCourseDetailReadModel interface {
	GetCourseDetail(ctx context.Context, courseID string) (*CourseDetail, error)
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
}
