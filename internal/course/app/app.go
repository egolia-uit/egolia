package app

type Cmds struct {
	MoveLesson              *MoveLessonHandler
	GetUploadVideoLessonURL *GetUploadVideoLessonURLHandler
	CreateCourse            *CreateCourseHandler
}

type Queries struct {
	GetCourseDetail *GetCourseDetailHandler
	GetCourse       *GetCourseHandler
	GetLessonDetail *GetLessonDetailHandler
	SearchCourses   *SearchCoursesHandler
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
