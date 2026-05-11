package app

import "github.com/goforj/wire"

var ProviderSetCmds = wire.NewSet(
	NewCreateCourseHandler,
	NewDeleteCourseHandler,
	NewUpdateCourseHandler,
	NewGetUploadVideoLessonURLHandler,
	NewMoveLessonHandler,
	NewEnrollInCourseHandler,
	NewFinishCourseHandler,
	NewReviewCourseHandler,
	NewBookmarkCourseHandler,
	NewHideCourseHandler,
	NewCreateSectionHandler,
	NewUpdateSectionTitleHandler,
	NewDeleteSectionHandler,
	wire.Struct(new(Cmds), "*"),
)

var ProviderSetQueries = wire.NewSet(
	NewGetCourseDetailHandler,
	NewGetCourseHandler,
	NewGetLessonDetailHandler,
	NewGetPublishedCoursesHandler,
	NewGetMyCoursesHandler,
	NewGetSystemCoursesHandler,
	NewGetMyBookmarkedCoursesHandler,
	NewGetMyEnrolledCoursesHandler,
	NewGetCourseLandingPageHandler,
	wire.Struct(new(Queries), "*"),
)

var ProviderSet = wire.NewSet(
	ProvideTracer,
	ProviderSetCmds,
	ProviderSetQueries,
	wire.Struct(new(App), "*"),
)
