package app

type Cmds struct {
	MoveLesson              *MoveLessonHandler
	GetUploadVideoLessonURL *GetUploadVideoLessonURLHandler
	CreateCourse            *CreateCourseHandler
	DeleteCourse            *DeleteCourseHandler
}

type Queries struct {
	GetCourseDetail *GetCourseDetailHandler
	GetCourse       *GetCourseHandler
	GetLessonDetail *GetLessonDetailHandler
	SearchCourses   *SearchCoursesHandler
	GetCourses      *GetCoursesHandler
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
