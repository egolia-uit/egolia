package http

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
	commonHTTP "github.com/egolia-uit/egolia/pkg/common/http"
	"github.com/google/uuid"
)

// enum page, limit, order, course status, course visibility

func (h *StrictHandler) GetMyCertificates(ctx context.Context, request course.GetMyCertificatesRequestObject) (course.GetMyCertificatesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCertificateById(ctx context.Context, request course.GetCertificateByIdRequestObject) (course.GetCertificateByIdResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CreateCertificate(ctx context.Context, request course.CreateCertificateRequestObject) (course.CreateCertificateResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CreateCourse(ctx context.Context, request course.CreateCourseRequestObject) (course.CreateCourseResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)

	if !ok {
		return nil, errs.Unauthorized
	}
	if request.Body == nil {
		return nil, errs.NewInvalid("request body is required")
	}
	userID := user.ID

	courseID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}
	overview := ""
	if request.Body.Overview != nil {
		overview = *request.Body.Overview
	}
	introductionVideoKey := (*string)(nil)
	if request.Body.IntroductionVideoKey != nil {
		introductionVideoKey = request.Body.IntroductionVideoKey
	}

	if err := h.App.Cmds.CreateCourse.Handle(ctx, &app.CreateCourse{
		ID:                   courseID,
		Title:                request.Body.Title,
		InstructorID:         userID,
		Price:                request.Body.Price,
		Overview:             overview,
		IntroductionVideoKey: *introductionVideoKey,
	}); err != nil {
		return nil, err
	}
	return course.CreateCourse201Response{
		Headers: course.CreateCourse201ResponseHeaders{
			ContentLocation: h.BaseURL.JoinPath("course", "courses", courseID.String()).String(),
		},
	}, nil
}

func (h *StrictHandler) GetMyCourses(ctx context.Context, request course.GetMyCoursesRequestObject) (course.GetMyCoursesResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID

	page := 1
	if request.Params.Page != nil && *request.Params.Page > 0 {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}

	var order *app.SearchCoursesOrder
	if request.Params.Order != nil {
		val := app.SearchCoursesOrder(*request.Params.Order)
		order = &val
	}

	result, err := h.App.Queries.GetMyCourses.Handle(ctx, &app.GetMyCourses{
		UserID: userID,
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order:              order,
		Hidden:             nil,
		Status:             nil,
		HaveOriginalCourse: nil,
	})
	if err != nil {
		return nil, err
	}

	courses := make([]course.Course, 0, len(result.Data))
	for i := range result.Data {
		courses = append(courses, *courseToDTO(&result.Data[i]))
	}

	pagination := result.Pagination
	return course.GetMyCourses200JSONResponse{
		Data: courses,
		Pagination: course.Pagination{
			Page:       pagination.Page,
			Limit:      pagination.Limit,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.HasNext,
			HasPrev:    pagination.HasPrev,
		},
	}, nil
}

func (h *StrictHandler) GetPublishedCourses(ctx context.Context, request course.GetPublishedCoursesRequestObject) (course.GetPublishedCoursesResponseObject, error) {
	page := 1
	if request.Params.Page != nil && *request.Params.Page > 0 {
		page = *request.Params.Page
	}

	limit := 20 // Đặt limit mặc định
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}

	var order *app.SearchCoursesOrder
	if request.Params.Order != nil {
		val := app.SearchCoursesOrder(*request.Params.Order)
		order = &val
	}

	result, err := h.App.Queries.GetPublishedCourses.Handle(ctx, &app.GetCourses{
		InstructorID: request.Params.InstructorId,
		Query:        request.Params.Query,
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order:              order,
		Hidden:             nil,
		Status:             nil,
		HaveOriginalCourse: nil,
	})
	if err != nil {
		return nil, err
	}

	courses := make([]course.Course, 0, len(result.Data))
	for i := range result.Data {
		courses = append(courses, *courseToDTO(&result.Data[i]))
	}

	pagination := result.Pagination
	return course.GetPublishedCourses200JSONResponse{
		Data: courses,
		Pagination: course.Pagination{
			Page:       pagination.Page,
			Limit:      pagination.Limit,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.HasNext,
			HasPrev:    pagination.HasPrev,
		},
	}, nil
}

func (h *StrictHandler) GetSystemCourses(ctx context.Context, request course.GetSystemCoursesRequestObject) (course.GetSystemCoursesResponseObject, error) {
	page := 1
	if request.Params.Page != nil {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	var order *app.SearchCoursesOrder
	if request.Params.Order != nil {
		val := app.SearchCoursesOrder(*request.Params.Order)
		order = &val
	}

	result, err := h.App.Queries.GetSystemCourses.Handle(ctx, &app.GetCourses{
		InstructorID: request.Params.Query,
		Query:        request.Params.InstructorId,
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order:              order,
		Hidden:             nil,
		Status:             nil,
		HaveOriginalCourse: nil,
	})
	if err != nil {
		return nil, err
	}

	courses := make([]course.Course, 0, len(result.Data))
	for i := range result.Data {
		courses = append(courses, *courseToDTO(&result.Data[i]))
	}

	pagination := result.Pagination
	return course.GetSystemCourses200JSONResponse{
		Data: courses,
		Pagination: course.Pagination{
			Page:       pagination.Page,
			Limit:      pagination.Limit,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.HasNext,
			HasPrev:    pagination.HasPrev,
		},
	}, nil
}

func (h *StrictHandler) GetMyEnrolledCourses(ctx context.Context, request course.GetMyEnrolledCoursesRequestObject) (course.GetMyEnrolledCoursesResponseObject, error) {
	// TODO: implement GetMyEnrolledCourses
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID
	page := 1
	if request.Params.Page != nil {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	var order *app.SearchCoursesOrder
	if request.Params.Order != nil {
		val := app.SearchCoursesOrder(*request.Params.Order)
		order = &val
	}

	result, err := h.App.Queries.GetMyEnrolledCourses.Handle(ctx, &app.GetMyEnrolledCourses{
		LearnerID: userID,
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order:  order,
		Hidden: nil,
		Status: nil,
	})
	if err != nil {
		return nil, err
	}

	courses := make([]course.Course, 0, len(result.Data))
	for i := range result.Data {
		courses = append(courses, *courseToDTO(&result.Data[i]))
	}

	pagination := result.Pagination
	return course.GetMyEnrolledCourses200JSONResponse{
		Data: courses,
		Pagination: course.Pagination{
			Page:       pagination.Page,
			Limit:      pagination.Limit,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.HasNext,
			HasPrev:    pagination.HasPrev,
		},
	}, nil
}

func (h *StrictHandler) GetMyBookmarkedCourses(ctx context.Context, request course.GetMyBookmarkedCoursesRequestObject) (course.GetMyBookmarkedCoursesResponseObject, error) {
	// TODO: implement GetMyBookmarkedCourses
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID
	page := 1
	if request.Params.Page != nil {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	var order *app.SearchCoursesOrder
	if request.Params.Order != nil {
		val := app.SearchCoursesOrder(*request.Params.Order)
		order = &val
	}

	result, err := h.App.Queries.GetMyBookmarkedCourses.Handle(ctx, &app.GetMyBookmarkedCourses{
		Hidden: nil,
		Status: nil,
		UserID: userID,
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order: order,
	})
	if err != nil {
		return nil, err
	}

	courses := make([]course.Course, 0, len(result.Data))
	for i := range result.Data {
		courses = append(courses, *courseToDTO(&result.Data[i]))
	}

	pagination := result.Pagination
	return course.GetMyBookmarkedCourses200JSONResponse{
		Data: courses,
		Pagination: course.Pagination{
			Page:       pagination.Page,
			Limit:      pagination.Limit,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.HasNext,
			HasPrev:    pagination.HasPrev,
		},
	}, nil
}

func (h *StrictHandler) DeleteCourse(ctx context.Context, request course.DeleteCourseRequestObject) (course.DeleteCourseResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID

	if err := h.App.Cmds.DeleteCourse.Handle(ctx, &app.DeleteCourse{
		CourseID: request.CourseId,
		ActorID:  userID,
	}); err != nil {
		return nil, err
	}
	return course.DeleteCourse204Response{}, nil
}

func (h *StrictHandler) ApproveCourse(ctx context.Context, request course.ApproveCourseRequestObject) (course.ApproveCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UpdateCourse(ctx context.Context, request course.UpdateCourseRequestObject) (course.UpdateCourseResponseObject, error) {
	if err := h.App.Cmds.UpdateCourse.Handle(ctx, &app.UpdateCourse{
		CourseID:             request.CourseId,
		Title:                request.Body.Title,
		Price:                request.Body.Price,
		Overview:             request.Body.Overview,
		IntroductionVideoKey: request.Body.IntroductionVideoKey,
	}); err != nil {
		return nil, err
	}
	return course.UpdateCourse204Response{}, nil
}

func (h *StrictHandler) BookmarkCourse(ctx context.Context, request course.BookmarkCourseRequestObject) (course.BookmarkCourseResponseObject, error) {
	courseID := request.CourseId
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID

	if err := h.App.Cmds.BookmarkCourse.Handle(ctx, &app.BookmarkCourse{
		CourseID: courseID,
		UserID:   userID,
	}); err != nil {
		return nil, err
	}
	return course.BookmarkCourse201Response{
		Headers: course.BookmarkCourse201ResponseHeaders{
			ContentLocation: "i dont know what to put here", // TODO: return the actual bookmark ID
		},
	}, nil
}

func (h *StrictHandler) UnbookmarkCourse(ctx context.Context, request course.UnbookmarkCourseRequestObject) (course.UnbookmarkCourseResponseObject, error) {
	courseID := request.CourseId
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID

	if err := h.App.Cmds.BookmarkCourse.Handle(ctx, &app.BookmarkCourse{
		CourseID: courseID,
		UserID:   userID,
	}); err != nil {
		return nil, err
	}
	return course.UnbookmarkCourse204Response{}, nil
}

func (h *StrictHandler) DeclineCourse(ctx context.Context, request course.DeclineCourseRequestObject) (course.DeclineCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseAnalytics(ctx context.Context, request course.GetCourseAnalyticsRequestObject) (course.GetCourseAnalyticsResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseDetail(ctx context.Context, request course.GetCourseDetailRequestObject) (course.GetCourseDetailResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID
	roles := make([]app.UserRole, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, app.UserRole(r))
	}

	query := &app.GetCourseDetail{
		CourseID:  request.CourseId,
		UserID:    userID,
		UserRoles: roles,
	}
	result, err := h.App.Queries.GetCourseDetail.Handle(ctx, query)
	if err != nil {
		return nil, err
	}
	courseDetail := courseDetailToDTO(result)
	return &course.GetCourseDetail200JSONResponse{
		Data: *courseDetail,
	}, nil
}

func (h *StrictHandler) FinishCourse(ctx context.Context, request course.FinishCourseRequestObject) (course.FinishCourseResponseObject, error) {
	// TODO: implement finish course
	courseID := request.CourseId
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID

	if err := h.App.Cmds.FinishCourse.Handle(ctx, &app.FinishCourse{
		CourseID: courseID,
		ActorID:  userID,
	}); err != nil {
		return nil, err
	}
	return course.FinishCourse204Response{}, nil
}

func (h *StrictHandler) HideCourse(ctx context.Context, request course.HideCourseRequestObject) (course.HideCourseResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID
	roles := make([]app.UserRole, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, app.UserRole(r))
	}

	if err := h.App.Cmds.HideCourse.Handle(ctx, &app.HideCourse{
		CourseID: request.CourseId,
		UserID:   userID,
		Roles:    roles,
	}); err != nil {
		return nil, err
	}
	return course.HideCourse204Response{}, nil
}

func (h *StrictHandler) UnhideCourse(ctx context.Context, request course.UnhideCourseRequestObject) (course.UnhideCourseResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID
	roles := make([]app.UserRole, 0, len(user.Roles))
	for _, r := range user.Roles {
		roles = append(roles, app.UserRole(r))
	}

	if err := h.App.Cmds.HideCourse.Handle(ctx, &app.HideCourse{
		CourseID: request.CourseId,
		UserID:   userID,
		Roles:    roles,
	}); err != nil {
		return nil, err
	}
	return course.UnhideCourse204Response{}, nil
}

func (h *StrictHandler) GetCourseLandingPage(ctx context.Context, request course.GetCourseLandingPageRequestObject) (course.GetCourseLandingPageResponseObject, error) {
	courseID := request.CourseId
	result, err := h.App.Queries.GetCourseLandingPage.Handle(ctx, &app.GetCourseLandingPage{
		CourseID: courseID,
	})
	if err != nil {
		return nil, err
	}
	return &course.GetCourseLandingPage200JSONResponse{
		Data: *courseToDTO(result),
	}, nil
}

func (h *StrictHandler) GetCourseProgress(ctx context.Context, request course.GetCourseProgressRequestObject) (course.GetCourseProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseReviews(ctx context.Context, request course.GetCourseReviewsRequestObject) (course.GetCourseReviewsResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) ReviewCourse(ctx context.Context, request course.ReviewCourseRequestObject) (course.ReviewCourseResponseObject, error) {
	// TODO: implement review course
	courseID := request.CourseId
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID := user.ID

	if err := h.App.Cmds.ReviewCourse.Handle(ctx, &app.ReviewCourse{
		CourseID: courseID,
		ActorID:  userID,
		Rating:   request.Body.Rating,
		Comment:  request.Body.Comment,
	}); err != nil {
		return nil, err
	}
	return course.ReviewCourse201Response{
		Headers: course.ReviewCourse201ResponseHeaders{
			ContentLocation: "i dont know what to put here", // TODO: return the actual review ID
		},
	}, nil
}

func (h *StrictHandler) UpdateReview(ctx context.Context, request course.UpdateReviewRequestObject) (course.UpdateReviewResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteReview(ctx context.Context, request course.DeleteReviewRequestObject) (course.DeleteReviewResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) ReplyLessonComment(ctx context.Context, request course.ReplyLessonCommentRequestObject) (course.ReplyLessonCommentResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteLessonComment(ctx context.Context, request course.DeleteLessonCommentRequestObject) (course.DeleteLessonCommentResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CreateLesson(ctx context.Context, request course.CreateLessonRequestObject) (course.CreateLessonResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteLesson(ctx context.Context, request course.DeleteLessonRequestObject) (course.DeleteLessonResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetLessonDetail(ctx context.Context, request course.GetLessonDetailRequestObject) (course.GetLessonDetailResponseObject, error) {
	query := &app.GetLessonDetail{
		LessonID: request.LessonId,
	}
	result, err := h.App.Queries.GetLessonDetail.Handle(ctx, query)
	if err != nil {
		return nil, err
	}
	lessonDetail, err := lessonDetailToDTO(result)
	if err != nil {
		return nil, err
	}
	return &course.GetLessonDetail200JSONResponse{
		Data: *lessonDetail,
	}, nil
}

func (h *StrictHandler) EditVideoLesson(ctx context.Context, request course.EditVideoLessonRequestObject) (course.EditVideoLessonResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) EditTestLesson(ctx context.Context, request course.EditTestLessonRequestObject) (course.EditTestLessonResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetLessonComments(ctx context.Context, request course.GetLessonCommentsRequestObject) (course.GetLessonCommentsResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CommentOnLesson(ctx context.Context, request course.CommentOnLessonRequestObject) (course.CommentOnLessonResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) MarkLessonAsCompleted(ctx context.Context, request course.MarkLessonAsCompletedRequestObject) (course.MarkLessonAsCompletedResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) MoveSection(ctx context.Context, request course.MoveSectionRequestObject) (course.MoveSectionResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) MoveLesson(ctx context.Context, request course.MoveLessonRequestObject) (course.MoveLessonResponseObject, error) {
	// var afterLesson *app.MoveLessonAfterLesson
	// if request.Body.AfterLesson != nil {
	// 	var t app.LessonType
	// 	switch request.Body.AfterLesson.Type {
	// 	case course.LessonTypeTest:
	// 		t = app.LessonTypeTest
	// 	case course.LessonTypeVideo:
	// 		t = app.LessonTypeVideo
	// 	}
	// 	afterLesson = &app.MoveLessonAfterLesson{
	// 		ID:   request.Body.AfterLesson.Id,
	// 		Type: t,
	// 	}
	// }
	// var lessonType app.LessonType
	// switch request.Body.Type {
	// case course.LessonTypeTest:
	// 	lessonType = app.LessonTypeTest
	// case course.LessonTypeVideo:
	// 	lessonType = app.LessonTypeVideo
	// }
	// cmd := &app.MoveLesson{
	// 	LessonID:    request.LessonId,
	// 	LessonType:  lessonType,
	// 	AfterLesson: afterLesson,
	// 	SectionID:   request.Body.SectionId,
	// }
	// err := h.App.Cmds.MoveLesson.Handle(ctx, cmd)
	// if err != nil {
	// 	return nil, err
	// }
	return &course.MoveLesson201Response{}, nil
}

func (h *StrictHandler) GetLessonProgress(ctx context.Context, request course.GetLessonProgressRequestObject) (course.GetLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) SaveVideoLessonProgress(ctx context.Context, request course.SaveVideoLessonProgressRequestObject) (course.SaveVideoLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseStudents(ctx context.Context, request course.GetCourseStudentsRequestObject) (course.GetCourseStudentsResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UpdateSectionTitle(ctx context.Context, request course.UpdateSectionTitleRequestObject) (course.UpdateSectionTitleResponseObject, error) {
	panic("unimplemented")
}

// GetUploadVideoUrl implements [course.StrictServerInterface].
func (h *StrictHandler) GetUploadVideoUrl(ctx context.Context, request course.GetUploadVideoUrlRequestObject) (course.GetUploadVideoUrlResponseObject, error) {
	cmd := &app.GetUploadVideoLessonURL{
		VideoFilename: request.Body.VideoFilename,
	}
	result, err := h.App.Queries.GetUploadVideoLessonURL.Handle(ctx, cmd)
	if err != nil {
		return nil, err
	}
	return &course.GetUploadVideoUrl201JSONResponse{
		VideoKey:  result.VideoKey,
		UploadUrl: result.UploadURL,
		ExpiresAt: result.ExpiresAt,
	}, nil
}

func (h *StrictHandler) CreateSection(ctx context.Context, request course.CreateSectionRequestObject) (course.CreateSectionResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteSection(ctx context.Context, request course.DeleteSectionRequestObject) (course.DeleteSectionResponseObject, error) {
	return nil, errs.Unimplemented
}
