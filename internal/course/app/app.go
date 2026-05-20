package app

import (
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"go.opentelemetry.io/otel/trace"
)

type HandlerProvider commonhandler.HandlerProvider

func NewHandlerProvider(
	traceProvider trace.TracerProvider,
	logger *slog.Logger,
) *HandlerProvider {
	tracer := traceProvider.Tracer("course-app")
	return (*HandlerProvider)(
		commonhandler.NewHandlerProvider(
			commonhandler.WithTracer(tracer),
			commonhandler.WithLogger(logger),
		),
	)
}

var ProvideHandlerProvider = NewHandlerProvider

type (
	ApproveCourseCmd           commonhandler.Cmd[ApproveCourse]
	BookmarkCourseCmd          commonhandler.Cmd[BookmarkCourse]
	CommentOnLessonCmd         commonhandler.Cmd[CommentOnLesson]
	CreateCourseCmd            commonhandler.Cmd[CreateCourse]
	CreateDraftVersionCmd      commonhandler.Cmd[CreateDraftVersion]
	CreateSectionCmd           commonhandler.Cmd[CreateSection]
	DeclineCourseCmd           commonhandler.Cmd[DeclineCourse]
	DeleteCourseCmd            commonhandler.Cmd[DeleteCourse]
	DeleteLessonCmd            commonhandler.Cmd[DeleteLesson]
	DeleteLessonCommentCmd     commonhandler.Cmd[DeleteLessonComment]
	DeleteReviewCmd            commonhandler.Cmd[DeleteReview]
	DeleteSectionCmd           commonhandler.Cmd[DeleteSection]
	EditTestLessonCmd          commonhandler.Cmd[EditTestLesson]
	EditVideoLessonCmd         commonhandler.Cmd[EditVideoLesson]
	EnrollInCourseCmd          commonhandler.Cmd[EnrollInCourse]
	FinishCourseCmd            commonhandler.Cmd[FinishCourse]
	GetCourseProgressCmd       commonhandler.Cmd[GetCourseProgress]
	HideCourseCmd              commonhandler.Cmd[HideCourse]
	MarkLessonAsCompletedCmd   commonhandler.Cmd[MarkLessonAsCompleted]
	MoveLessonCmd              commonhandler.Cmd[MoveLesson]
	MoveSectionCmd             commonhandler.Cmd[MoveSection]
	ReplyOnLessonCommentCmd    commonhandler.Cmd[ReplyOnLessonComment]
	ReviewCourseCmd            commonhandler.Cmd[ReviewCourse]
	SaveVideoLessonProgressCmd commonhandler.Cmd[SaveVideoLessonProgress]
	SubmitCourseCmd            commonhandler.Cmd[SubmitCourse]
	UpdateCourseCmd            commonhandler.Cmd[UpdateCourse]
	UpdateReviewCmd            commonhandler.Cmd[UpdateReview]
	UpdateSectionTitleCmd      commonhandler.Cmd[UpdateSectionTitle]
)

type (
	GetCourseQuery               commonhandler.Query[GetCourse, *Course]
	GetCourseDetailQuery         commonhandler.Query[GetCourseDetail, *CourseDetail]
	GetCourseForUpdateQuery      commonhandler.Query[GetCourseForUpdate, *CourseDetail]
	GetCourseLandingPageQuery    commonhandler.Query[GetCourseLandingPage, *Course]
	GetCourseReviewsQuery        commonhandler.Query[GetCourseReviews, *Paginated[Review]]
	GetLessonCommentsQuery       commonhandler.Query[GetLessonComments, []*LessonComment]
	GetLessonDetailQuery         commonhandler.Query[GetLessonDetail, Lesson]
	GetLessonProgressQuery       commonhandler.Query[GetLessonProgress, domain.LessonProgress]
	GetMyBookmarkedCoursesQuery  commonhandler.Query[GetMyBookmarkedCourses, *Paginated[Course]]
	GetMyCertificatesQuery       commonhandler.Query[GetMyCertificates, *Paginated[Certificate]]
	GetMyCoursesQuery            commonhandler.Query[GetMyCourses, *Paginated[Course]]
	GetMyEnrolledCoursesQuery    commonhandler.Query[GetMyEnrolledCourses, *Paginated[Course]]
	GetPublishedCoursesQuery     commonhandler.Query[GetCourses, *Paginated[Course]]
	GetSystemCoursesQuery        commonhandler.Query[GetCourses, *Paginated[Course]]
	GetUploadVideoLessonURLQuery commonhandler.Query[GetUploadVideoLessonURL, *VideoLessonObject]
)

type Cmds struct {
	ApproveCourse           ApproveCourseCmd
	BookmarkCourse          BookmarkCourseCmd
	CommentOnLesson         CommentOnLessonCmd
	CreateCourse            CreateCourseCmd
	CreateDraftVersion      CreateDraftVersionCmd
	CreateLesson            CreateLessonCmd
	CreateSection           CreateSectionCmd
	DeclineCourse           DeclineCourseCmd
	DeleteCourse            DeleteCourseCmd
	DeleteLesson            DeleteLessonCmd
	DeleteLessonComment     DeleteLessonCommentCmd
	DeleteReview            DeleteReviewCmd
	DeleteSection           DeleteSectionCmd
	EditTestLesson          EditTestLessonCmd
	EditVideoLesson         EditVideoLessonCmd
	EnrollInCourse          EnrollInCourseCmd
	FinishCourse            FinishCourseCmd
	GetCourseProgress       GetCourseProgressCmd
	HideCourse              HideCourseCmd
	MarkLessonAsCompleted   MarkLessonAsCompletedCmd
	MoveLesson              MoveLessonCmd
	MoveSection             MoveSectionCmd
	ReplyOnLessonComment    ReplyOnLessonCommentCmd
	ReviewCourse            ReviewCourseCmd
	SaveVideoLessonProgress SaveVideoLessonProgressCmd
	SubmitCourse            SubmitCourseCmd
	UpdateCourse            UpdateCourseCmd
	UpdateReview            UpdateReviewCmd
	UpdateSectionTitle      UpdateSectionTitleCmd
}

func NewCmds(
	handlerProvider *HandlerProvider,
	uow domain.UnitOfWork,
	approveCourseHandler *ApproveCourseHandler,
	bookmarkCourseHandler *BookmarkCourseHandler,
	commentOnLessonHandler *CommentOnLessonHandler,
	createCourseHandler *CreateCourseHandler,
	createDraftVersionHandler *CreateDraftVersionHandler,
	createLessonCmd CreateLessonCmd,
	createSectionHandler *CreateSectionHandler,
	declineCourseHandler *DeclineCourseHandler,
	deleteCourseHandler *DeleteCourseHandler,
	deleteLessonHandler *DeleteLessonHandler,
	deleteLessonCommentHandler *DeleteLessonCommentHandler,
	deleteReviewHandler *DeleteReviewHandler,
	deleteSectionHandler *DeleteSectionHandler,
	editTestLessonHandler *EditTestLessonHandler,
	editVideoLessonHandler *EditVideoLessonHandler,
	enrollInCourseHandler *EnrollInCourseHandler,
	finishCourseHandler *FinishCourseHandler,
	getCourseProgressHandler *GetCourseProgressHandler,
	hideCourseHandler *HideCourseHandler,
	markLessonAsCompletedHandler *MarkLessonAsCompletedHandler,
	moveLessonHandler *MoveLessonHandler,
	moveSectionHandler *MoveSectionHandler,
	replyOnLessonCommentHandler *ReplyOnLessonCommentHandler,
	reviewCourseHandler *ReviewCourseHandler,
	submitCourseHandler *SubmitCourseHandler,
	updateCourseHandler *UpdateCourseHandler,
	updateReviewHandler *UpdateReviewHandler,
	updateSectionTitleHandler *UpdateSectionTitleHandler,
) *Cmds {
	hp := (*commonhandler.HandlerProvider)(handlerProvider)
	markCompleted := commonhandler.DecorateCmd(hp, markLessonAsCompletedHandler)
	saveVideoLessonProgressHandler := &SaveVideoLessonProgressHandler{
		uow:                      uow,
		markLessonAsCompletedCmd: markCompleted,
	}
	return &Cmds{
		ApproveCourse:           commonhandler.DecorateCmd(hp, approveCourseHandler),
		BookmarkCourse:          commonhandler.DecorateCmd(hp, bookmarkCourseHandler),
		CommentOnLesson:         commonhandler.DecorateCmd(hp, commentOnLessonHandler),
		CreateCourse:            commonhandler.DecorateCmd(hp, createCourseHandler),
		CreateDraftVersion:      commonhandler.DecorateCmd(hp, createDraftVersionHandler),
		CreateLesson:            createLessonCmd,
		CreateSection:           commonhandler.DecorateCmd(hp, createSectionHandler),
		DeclineCourse:           commonhandler.DecorateCmd(hp, declineCourseHandler),
		DeleteCourse:            commonhandler.DecorateCmd(hp, deleteCourseHandler),
		DeleteLesson:            commonhandler.DecorateCmd(hp, deleteLessonHandler),
		DeleteLessonComment:     commonhandler.DecorateCmd(hp, deleteLessonCommentHandler),
		DeleteReview:            commonhandler.DecorateCmd(hp, deleteReviewHandler),
		DeleteSection:           commonhandler.DecorateCmd(hp, deleteSectionHandler),
		EditTestLesson:          commonhandler.DecorateCmd(hp, editTestLessonHandler),
		EditVideoLesson:         commonhandler.DecorateCmd(hp, editVideoLessonHandler),
		EnrollInCourse:          commonhandler.DecorateCmd(hp, enrollInCourseHandler),
		FinishCourse:            commonhandler.DecorateCmd(hp, finishCourseHandler),
		GetCourseProgress:       commonhandler.DecorateCmd(hp, getCourseProgressHandler),
		HideCourse:              commonhandler.DecorateCmd(hp, hideCourseHandler),
		MarkLessonAsCompleted:   markCompleted,
		MoveLesson:              commonhandler.DecorateCmd(hp, moveLessonHandler),
		MoveSection:             commonhandler.DecorateCmd(hp, moveSectionHandler),
		ReplyOnLessonComment:    commonhandler.DecorateCmd(hp, replyOnLessonCommentHandler),
		ReviewCourse:            commonhandler.DecorateCmd(hp, reviewCourseHandler),
		SaveVideoLessonProgress: commonhandler.DecorateCmd(hp, saveVideoLessonProgressHandler),
		SubmitCourse:            commonhandler.DecorateCmd(hp, submitCourseHandler),
		UpdateCourse:            commonhandler.DecorateCmd(hp, updateCourseHandler),
		UpdateReview:            commonhandler.DecorateCmd(hp, updateReviewHandler),
		UpdateSectionTitle:      commonhandler.DecorateCmd(hp, updateSectionTitleHandler),
	}
}

type Queries struct {
	GetCourse               GetCourseQuery
	GetCourseDetail         GetCourseDetailQuery
	GetCourseForUpdate      GetCourseForUpdateQuery
	GetCourseLandingPage    GetCourseLandingPageQuery
	GetCourseReviews        GetCourseReviewsQuery
	GetLessonComments       GetLessonCommentsQuery
	GetLessonDetail         GetLessonDetailQuery
	GetLessonProgress       GetLessonProgressQuery
	GetMyBookmarkedCourses  GetMyBookmarkedCoursesQuery
	GetMyCertificates       GetMyCertificatesQuery
	GetMyCourses            GetMyCoursesQuery
	GetMyEnrolledCourses    GetMyEnrolledCoursesQuery
	GetPublishedCourses     GetPublishedCoursesQuery
	GetSystemCourses        GetSystemCoursesQuery
	GetUploadVideoLessonURL GetUploadVideoLessonURLQuery
}

func NewQueries(
	handlerProvider *HandlerProvider,
	getCourseHandler *GetCourseHandler,
	getCourseDetailHandler *GetCourseDetailHandler,
	getCourseForUpdateHandler *GetCourseForUpdateHandler,
	getCourseLandingPageHandler *GetCourseLandingPageHandler,
	getCourseReviewsHandler *GetCourseReviewsHandler,
	getLessonCommentsHandler *GetLessonCommentsHandler,
	getLessonDetailHandler *GetLessonDetailHandler,
	getLessonProgressHandler *GetLessonProgressHandler,
	getMyBookmarkedCoursesHandler *GetMyBookmarkedCoursesHandler,
	getMyCertificatesHandler *GetMyCertificatesHandler,
	getMyCoursesHandler *GetMyCoursesHandler,
	getMyEnrolledCoursesHandler *GetMyEnrolledCoursesHandler,
	getPublishedCoursesHandler *GetPublishedCoursesHandler,
	getSystemCoursesHandler *GetSystemCoursesHandler,
	getUploadVideoLessonURLHandler *GetUploadVideoLessonURLHandler,
) *Queries {
	hp := (*commonhandler.HandlerProvider)(handlerProvider)
	return &Queries{
		GetCourse:               commonhandler.DecorateQuery(hp, getCourseHandler),
		GetCourseDetail:         commonhandler.DecorateQuery(hp, getCourseDetailHandler),
		GetCourseForUpdate:      commonhandler.DecorateQuery(hp, getCourseForUpdateHandler),
		GetCourseLandingPage:    commonhandler.DecorateQuery(hp, getCourseLandingPageHandler),
		GetCourseReviews:        commonhandler.DecorateQuery(hp, getCourseReviewsHandler),
		GetLessonComments:       commonhandler.DecorateQuery(hp, getLessonCommentsHandler),
		GetLessonDetail:         commonhandler.DecorateQuery(hp, getLessonDetailHandler),
		GetLessonProgress:       commonhandler.DecorateQuery(hp, getLessonProgressHandler),
		GetMyBookmarkedCourses:  commonhandler.DecorateQuery(hp, getMyBookmarkedCoursesHandler),
		GetMyCertificates:       commonhandler.DecorateQuery(hp, getMyCertificatesHandler),
		GetMyCourses:            commonhandler.DecorateQuery(hp, getMyCoursesHandler),
		GetMyEnrolledCourses:    commonhandler.DecorateQuery(hp, getMyEnrolledCoursesHandler),
		GetPublishedCourses:     commonhandler.DecorateQuery(hp, getPublishedCoursesHandler),
		GetSystemCourses:        commonhandler.DecorateQuery(hp, getSystemCoursesHandler),
		GetUploadVideoLessonURL: commonhandler.DecorateQuery(hp, getUploadVideoLessonURLHandler),
	}
}

type App struct {
	Cmds    *Cmds
	Queries *Queries
}
