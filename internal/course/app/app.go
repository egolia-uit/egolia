package app

type Cmds struct {
	MoveLesson              *MoveLessonHandler
	GetUploadVideoLessonURL *GetUploadVideoLessonURLHandler
	CreateCourse            *CreateCourseHandler
	DeleteCourse            *DeleteCourseHandler
	UpdateCourse            *UpdateCourseHandler
}

type Queries struct {
	GetCourseDetail      *GetCourseDetailHandler
	GetCourse            *GetCourseHandler
	GetLessonDetail      *GetLessonDetailHandler
	SearchCourses        *SearchCoursesHandler
	GetCourses           *GetCoursesHandler
	GetInstructorCourses *GetInstructorCoursesHandler
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
