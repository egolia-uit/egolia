package app

import "github.com/goforj/wire"

var ProviderSetCmds = wire.NewSet(
	NewCreateCourseHandler,
	NewDeleteCourseHandler,
	NewUpdateCourseHandler,
	NewGetUploadVideoLessonURLHandler,
	NewMoveLessonHandler,
	NewMoveSectionHandler,
	NewSubmitCourseHandler,
	NewUpdateReviewHandler,
	NewDeleteReviewHandler,
	NewEnrollInCourseHandler,
	NewFinishCourseHandler,
	NewReviewCourseHandler,
	NewBookmarkCourseHandler,
	NewHideCourseHandler,
	NewCreateSectionHandler,
	NewUpdateSectionTitleHandler,
	NewDeleteSectionHandler,
	NewCreateDraftVersionHandler,
	NewCreateLessonCmd,
	NewEditVideoLessonHandler,
	NewApproveCourseHandler,
	NewReplyOnLessonCommentHandler,
	NewCommentOnLessonHandler,
	NewEditTestLessonHandler,
	NewDeleteLessonCommentHandler,
	NewDeclineCourseHandler,
	NewSaveVideoLessonProgressHandler,
	NewMarkLessonAsCompletedHandler,
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
	NewGetCourseForUpdateHandler,
	NewGetCourseProgressHandler,
	wire.Struct(new(Queries), "*"),
)

var ProviderSet = wire.NewSet(
	ProvideTracer,
	ProviderSetCmds,
	ProviderSetQueries,
	wire.Struct(new(App), "*"),
)
