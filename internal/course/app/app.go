package app

type Cmds struct {
	CreateCourse       CreateCourseCmd
	DeleteCourse       DeleteCourseCmd
	EnrollInCourse     EnrollInCourseCmd
	FinishCourse       FinishCourseCmd
	MoveLesson         MoveLessonCmd
	ReviewCourse       ReviewCourseCmd
	UpdateCourse       UpdateCourseCmd
	BookmarkCourse     BookmarkCourseCmd
	HideCourse         HideCourseCmd
	CreateSection      CreateSectionCmd
	UpdateSectionTitle UpdateSectionTitleCmd
	DeleteSection      DeleteSectionCmd
	MoveSection        MoveSectionCmd
	UpdateReview       UpdateReviewCmd
	DeleteReview       DeleteReviewCmd
	SubmitCourse       SubmitCourseCmd
	CreateDraftVersion CreateDraftVersionCmd
	CreateLesson       CreateLessonCmd
	EditVideoLesson    EditVideoLessonCmd
	ApproveCourse      ApproveCourseCmd
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
	GetCourseLandingPage    GetCourseLandingPageQuery
	GetCourseForUpdate      GetCourseForUpdateQuery
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
