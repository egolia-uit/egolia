package app

type Cmds struct {
	CreateCourse   CreateCourseCmd
	DeleteCourse   DeleteCourseCmd
	EnrollInCourse EnrollInCourseCmd
	FinishCourse   FinishCourseCmd
	MoveLesson     MoveLessonCmd
	ReviewCourse   ReviewCourseCmd
	UpdateCourse   UpdateCourseCmd
}

type Queries struct {
	GetCourse               GetCourseQuery
	GetCourseDetail         GetCourseDetailQuery
	GetCourses              GetCoursesQuery
	GetInstructorCourses    GetInstructorCoursesQuery
	GetLessonDetail         GetLessonDetailQuery
	GetUploadVideoLessonURL GetUploadVideoLessonURLQuery
	SearchCourses           SearchCoursesQuery
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
