package app

type Cmds struct {
	CreateCourse   CreateCourseCmd
	DeleteCourse   DeleteCourseCmd
	EnrollInCourse EnrollInCourseCmd
	FinishCourse   FinishCourseCmd
	MoveLesson     MoveLessonCmd
	ReviewCourse   ReviewCourseCmd
	UpdateCourse   UpdateCourseCmd
	BookmarkCourse BookmarkCourseCmd
}

type Queries struct {
	GetCourse               GetCourseQuery
	GetCourseDetail         GetCourseDetailQuery
	GetMyCourses            GetMyCoursesQuery
	GetPublishedCourses     GetPublishedCoursesQuery
	GetLessonDetail         GetLessonDetailQuery
	GetUploadVideoLessonURL GetUploadVideoLessonURLQuery
	GetSystemCourses        GetSystemCoursesQuery
	GetMyBookmarkedCourses  GetMyBookmarkedCoursesQuery
	GetMyEnrolledCourses    GetMyEnrolledCoursesQuery
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
