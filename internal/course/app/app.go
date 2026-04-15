package app

type Cmds struct {
	MoveLesson              *MoveLessonHandler
	GetUploadVideoLessonURL *GetUploadVideoLessonURLHandler
}

type Queries struct {
	GetCourseDetail *GetCourseDetailHandler
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
