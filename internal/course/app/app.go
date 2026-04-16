package app

type Cmds struct {
	MoveLesson              *MoveLessonHandler
	GetUploadVideoLessonURL *GetUploadVideoLessonURLHandler
}

type Queries struct {
	GetCourseDetail   *GetCourseDetailHandler
	GetCourseMetadata *GetCourseMetadataHandler
	GetLessonDetail   *GetLessonDetailHandler
	SearchCourses     *SearchCoursesHandler
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
