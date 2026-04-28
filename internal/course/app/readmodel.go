package app

import (
	"context"
)

type GetCourseReadModel interface {
	GetCourse(ctx context.Context, courseID string) (*Course, error)
}

type SearchCoursesReadModel interface {
	SearchCourses(ctx context.Context, params *SearchCourses) (*Paginated[Course], error)
}

type GetCourseDetailReadModel interface {
	GetCourseDetail(ctx context.Context, courseID string) (*CourseDetail, error)
}

type GetLessonDetailReadModel interface {
	GetVideoLessonDetail(ctx context.Context, params *GetLessonDetail) (*VideoLesson, error)
	GetTestLessonDetail(ctx context.Context, params *GetLessonDetail) (*TestLesson, error)
}
