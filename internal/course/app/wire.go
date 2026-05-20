package app

import (
	"github.com/goforj/wire"
)

var ProviderSetCmds = wire.NewSet(
	NewCreateCourseHandler,
	NewDeleteCourseHandler,
	NewUpdateCourseHandler,
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
	NewDeleteLessonHandler,
	NewCreateLessonCmd,
	NewEditVideoLessonHandler,
	NewApproveCourseHandler,
	NewReplyOnLessonCommentHandler,
	NewCommentOnLessonHandler,
	NewEditTestLessonHandler,
	NewDeleteLessonCommentHandler,
	NewDeclineCourseHandler,
	NewMarkLessonAsCompletedHandler,
	NewGetCourseProgressHandler,
	NewCmds,
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
	NewGetCourseReviewsHandler,
	NewGetMyCertificatesHandler,
	NewGetLessonCommentsHandler,
	NewGetLessonProgressHandler,
	NewGetUploadVideoLessonURLHandler,
	NewQueries,
)

var ProviderSet = wire.NewSet(
	ProvideHandlerProvider,
	ProviderSetCmds,
	ProviderSetQueries,
	wire.Struct(new(App), "*"),
)
