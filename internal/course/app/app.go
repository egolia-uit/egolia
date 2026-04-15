package app

type Cmds struct {
	MoveLesson              *MoveLessonHandler
	GetUploadVideoLessonURL *GetUploadVideoLessonURLHandler
}

type Queries struct {
	GetCourseDetail *GetCourseDetailHandler
	GetLessonDetail *GetLessonDetailHandler
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
