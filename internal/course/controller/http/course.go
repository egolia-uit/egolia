package http

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
	commonHTTP "github.com/egolia-uit/egolia/pkg/common/http"
	"github.com/google/uuid"
)

func (h *StrictHandler) GetMyCertificates(ctx context.Context, request course.GetMyCertificatesRequestObject) (course.GetMyCertificatesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCertificateById(ctx context.Context, request course.GetCertificateByIdRequestObject) (course.GetCertificateByIdResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) SearchCourses(ctx context.Context, request course.SearchCoursesRequestObject) (course.SearchCoursesResponseObject, error) {
	page := 1
	if request.Params.Page != nil {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	query := ""
	if request.Params.Q != nil {
		query = *request.Params.Q
	}
	instructorIDs := []string(nil)
	if request.Params.InstructorId != nil {
		instructorIDs = make([]string, 0, len(*request.Params.InstructorId))
		for _, id := range *request.Params.InstructorId {
			instructorIDs = append(instructorIDs, id.String())
		}
	}
	order := app.SearchCoursesOrderDesc
	if request.Params.Order != nil {
		order = app.SearchCoursesOrder(*request.Params.Order)
	}

	result, err := h.App.Queries.SearchCourses.Handle(ctx, &app.SearchCourses{
		Query:         query,
		InstructorIDs: instructorIDs,
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
	return course.SearchCourses200JSONResponse{
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

func (h *StrictHandler) CreateCourse(ctx context.Context, request course.CreateCourseRequestObject) (course.CreateCourseResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	if request.Body == nil {
		return nil, errs.NewInvalid("request body is required")
	}
	userID, err := uuid.Parse(user.ID)
	if err != nil {
		return nil, errs.NewInvalid("authenticated user id must be a valid uuid")
	}
	isAdmin := false
	isInstructor := false
	for _, role := range user.Roles {
		switch role {
		case commonHTTP.UserRoleAdmin:
			isAdmin = true
		case commonHTTP.UserRoleInstructor:
			isInstructor = true
		}
	}
	if !isAdmin && !isInstructor {
		return nil, errs.NewForbidden("only instructor or admin can create course")
	}

	courseID, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}
	overview := ""
	if request.Body.Overview != nil {
		overview = *request.Body.Overview
	}
	introduction := app.CourseLandingPageIntroduction{}
	if request.Body.Introduction != nil {
		introduction = app.CourseLandingPageIntroduction{
			VideoUrl: request.Body.Introduction.VideoUrl,
		}
	}

	if err := h.App.Cmds.CreateCourse.Handle(ctx, &app.CreateCourse{
		ID:           courseID,
		Title:        request.Body.Title,
		InstructorID: userID,
		Price:        request.Body.Price,
		Overview:     overview,
		Introduction: introduction,
	}); err != nil {
		return nil, err
	}
	return course.CreateCourse201Response{
		Headers: course.CreateCourse201ResponseHeaders{
			ContentLocation: h.BaseURL.JoinPath("course", "courses", courseID.String()).String(),
		},
	}, nil
}

func (h *StrictHandler) GetInstructorCourses(ctx context.Context, request course.GetInstructorCoursesRequestObject) (course.GetInstructorCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetPublishedCourses(ctx context.Context, request course.GetPublishedCoursesRequestObject) (course.GetPublishedCoursesResponseObject, error) {
	page := 1
	if request.Params.Page != nil {
		page = *request.Params.Page
	}
	limit := 20
	if request.Params.Limit != nil {
		limit = *request.Params.Limit
	}
	order := app.SearchCoursesOrderDesc
	if request.Params.Order != nil {
		order = app.SearchCoursesOrder(*request.Params.Order)
	}

	result, err := h.App.Queries.GetCourses.Handle(ctx, &app.GetCourses{
		Paginate: app.PaginationParams{
			Page:  page,
			Limit: limit,
		},
		Order:  order,
		Hidden: false,
		Status: app.CourseStatusApproved,
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
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetMyEnrolledCourses(ctx context.Context, request course.GetMyEnrolledCoursesRequestObject) (course.GetMyEnrolledCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteCourse(ctx context.Context, request course.DeleteCourseRequestObject) (course.DeleteCourseResponseObject, error) {
	user, ok := commonHTTP.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	userID, err := uuid.Parse(user.ID)
	if err != nil {
		return nil, errs.NewInvalid("authenticated user id must be a valid uuid")
	}
	isAdmin := false
	isInstructor := false
	// for _, role := range user.Roles {
	// 	switch role {
	// 	case UserRoleAdmin:
	// 		isAdmin = true
	// 	case UserRoleInstructor:
	// 		isInstructor = true
	// 	}
	// }
	if !isAdmin && !isInstructor {
		return nil, errs.NewForbidden("only instructor or admin can delete course")
	}
	if err := h.App.Cmds.DeleteCourse.Handle(ctx, &app.DeleteCourse{
		CourseID: request.CourseId,
		ActorID:  userID,
		IsAdmin:  isAdmin,
	}); err != nil {
		return nil, err
	}
	return course.DeleteCourse204Response{}, nil
}

func (h *StrictHandler) ApproveCourse(ctx context.Context, request course.ApproveCourseRequestObject) (course.ApproveCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UpdateCourse(ctx context.Context, request course.UpdateCourseRequestObject) (course.UpdateCourseResponseObject, error) {
	// user, ok := commonHTTP.UserFromContext(ctx)
	// if !ok {
	// 	return nil, errs.Unauthorized
	// }
	// if request.Body == nil {
	// 	return nil, errs.NewInvalid("request body is required")
	// }
	// userID, err := uuid.Parse(user.ID)
	// if err != nil {
	// 	return nil, errs.NewInvalid("authenticated user id must be a valid uuid")
	// }
	// isAdmin := false
	// isInstructor := false
	// for _, role := range user.Roles {
	// 	switch role {
	// 	case commonHTTP.UserRoleAdmin:
	// 		isAdmin = true
	// 	case commonHTTP.UserRoleInstructor:
	// 		isInstructor = true
	// 	}
	// }
	// if !isAdmin && !isInstructor {
	// 	return nil, errs.NewForbidden("only instructor or admin can update course")
	// }

	// overview := ""
	// if request.Body.Overview != nil {
	// 	overview = *request.Body.Overview
	// }

	// introduction := app.CourseLandingPageIntroduction{}
	// if request.Body.Introduction != nil {
	// 	introduction = app.CourseLandingPageIntroduction{
	// 		VideoUrl: request.Body.Introduction.VideoUrl,
	// 	}
	// }

	// if err := h.App.Cmds.UpdateCourse.Handle(ctx, &app.UpdateCourse{
	// 	CourseID:     request.CourseId,
	// 	ActorID:      userID,
	// 	IsAdmin:      isAdmin,
	// 	Title:        request.Body.Title,
	// 	Price:        request.Body.Price,
	// 	Overview:     overview,
	// 	Introduction: introduction,
	// }); err != nil {
	// 	return nil, err
	// }
	return course.UpdateCourse204Response{}, nil
}

func (h *StrictHandler) BookmarkCourse(ctx context.Context, request course.BookmarkCourseRequestObject) (course.BookmarkCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeclineCourse(ctx context.Context, request course.DeclineCourseRequestObject) (course.DeclineCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseDetail(ctx context.Context, request course.GetCourseDetailRequestObject) (course.GetCourseDetailResponseObject, error) {
	query := &app.GetCourseDetail{
		CourseID: request.CourseId.String(),
	}
	result, err := h.App.Queries.GetCourseDetail.Handle(ctx, *query)
	if err != nil {
		return nil, err
	}
	courseDetail := courseDetailToDTO(result)
	return &course.GetCourseDetail200JSONResponse{
		Data: *courseDetail,
	}, nil
}

func (h *StrictHandler) EnrollInCourse(ctx context.Context, request course.EnrollInCourseRequestObject) (course.EnrollInCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) FinishCourse(ctx context.Context, request course.FinishCourseRequestObject) (course.FinishCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) HideCourse(ctx context.Context, request course.HideCourseRequestObject) (course.HideCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseLandingPage(ctx context.Context, request course.GetCourseLandingPageRequestObject) (course.GetCourseLandingPageResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseProgress(ctx context.Context, request course.GetCourseProgressRequestObject) (course.GetCourseProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) ReviewCourse(ctx context.Context, request course.ReviewCourseRequestObject) (course.ReviewCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) TriggerLearningReminder(ctx context.Context, request course.TriggerLearningReminderRequestObject) (course.TriggerLearningReminderResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UnbookmarkCourse(ctx context.Context, request course.UnbookmarkCourseRequestObject) (course.UnbookmarkCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UnhideCourse(ctx context.Context, request course.UnhideCourseRequestObject) (course.UnhideCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) ReplyLessonComment(ctx context.Context, request course.ReplyLessonCommentRequestObject) (course.ReplyLessonCommentResponseObject, error) {
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

func (h *StrictHandler) EditTestLesson(ctx context.Context, request course.EditTestLessonRequestObject) (course.EditTestLessonResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) EditVideoLesson(ctx context.Context, request course.EditVideoLessonRequestObject) (course.EditVideoLessonResponseObject, error) {
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
	var afterLesson *app.MoveLessonAfterLesson
	if request.Body.AfterLesson != nil {
		var t app.LessonType
		switch request.Body.AfterLesson.Type {
		case course.LessonTypeTest:
			t = app.LessonTypeTest
		case course.LessonTypeVideo:
			t = app.LessonTypeVideo
		}
		afterLesson = &app.MoveLessonAfterLesson{
			ID:   request.Body.AfterLesson.Id,
			Type: t,
		}
	}
	var lessonType app.LessonType
	switch request.Body.Type {
	case course.LessonTypeTest:
		lessonType = app.LessonTypeTest
	case course.LessonTypeVideo:
		lessonType = app.LessonTypeVideo
	}
	cmd := &app.MoveLesson{
		LessonID:    request.LessonId,
		LessonType:  lessonType,
		AfterLesson: afterLesson,
		SectionID:   request.Body.SectionId,
	}
	err := h.App.Cmds.MoveLesson.Handle(ctx, cmd)
	if err != nil {
		return nil, err
	}
	return &course.MoveLesson201Response{}, nil
}

func (h *StrictHandler) GetLessonProgress(ctx context.Context, request course.GetLessonProgressRequestObject) (course.GetLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) SaveTestLessonProgress(ctx context.Context, request course.SaveTestLessonProgressRequestObject) (course.SaveTestLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) SaveVideoLessonProgress(ctx context.Context, request course.SaveVideoLessonProgressRequestObject) (course.SaveVideoLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UpdateSectionTitle(ctx context.Context, request course.UpdateSectionTitleRequestObject) (course.UpdateSectionTitleResponseObject, error) {
	panic("unimplemented")
}

func (h *StrictHandler) CreateTest(ctx context.Context, request course.CreateTestRequestObject) (course.CreateTestResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetUploadVideoLessonUrl(ctx context.Context, request course.GetUploadVideoLessonUrlRequestObject) (course.GetUploadVideoLessonUrlResponseObject, error) {
	cmd := &app.GetUploadVideoLessonURL{
		LessonID:      request.LessonId,
		VideoFilename: request.Body.VideoFilename,
	}
	result, err := h.App.Cmds.GetUploadVideoLessonURL.Handle(ctx, cmd)
	if err != nil {
		return nil, err
	}
	return &course.GetUploadVideoLessonUrl201JSONResponse{
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
