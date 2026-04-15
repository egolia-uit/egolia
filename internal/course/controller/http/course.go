package http

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/pkg/api/course"
)

func (h *StrictHandler) GetMyCertificates(ctx context.Context, request course.GetMyCertificatesRequestObject) (course.GetMyCertificatesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCertificateById(ctx context.Context, request course.GetCertificateByIdRequestObject) (course.GetCertificateByIdResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) SearchCourses(ctx context.Context, request course.SearchCoursesRequestObject) (course.SearchCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CreateCourse(ctx context.Context, request course.CreateCourseRequestObject) (course.CreateCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetInstructorCourses(ctx context.Context, request course.GetInstructorCoursesRequestObject) (course.GetInstructorCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetPublishedCourses(ctx context.Context, request course.GetPublishedCoursesRequestObject) (course.GetPublishedCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetSystemCourses(ctx context.Context, request course.GetSystemCoursesRequestObject) (course.GetSystemCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetMyEnrolledCourses(ctx context.Context, request course.GetMyEnrolledCoursesRequestObject) (course.GetMyEnrolledCoursesResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteCourse(ctx context.Context, request course.DeleteCourseRequestObject) (course.DeleteCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) ApproveCourse(ctx context.Context, request course.ApproveCourseRequestObject) (course.ApproveCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) UpdatedCourse(ctx context.Context, request course.UpdatedCourseRequestObject) (course.UpdatedCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) BookmarkCourse(ctx context.Context, request course.BookmarkCourseRequestObject) (course.BookmarkCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeclineCourse(ctx context.Context, request course.DeclineCourseRequestObject) (course.DeclineCourseResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetCourseDetail(ctx context.Context, request course.GetCourseDetailRequestObject) (course.GetCourseDetailResponseObject, error) {
	return nil, errs.Unimplemented
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
	return nil, errs.Unimplemented
}

func (h *StrictHandler) EditLesson(ctx context.Context, request course.EditLessonRequestObject) (course.EditLessonResponseObject, error) {
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

func (h *StrictHandler) MoveLesson(ctx context.Context, request course.MoveLessonRequestObject) (course.MoveLessonResponseObject, error) {
	var afterLesson *app.MoveLessonAfterLesson
	if request.Body.AfterLesson != nil {
		var t app.LessonType
		switch request.Body.AfterLesson.Type {
		case course.LessonTypeTestLesson:
			t = app.LessonTypeTest
		case course.LessonTypeVideoLesson:
			t = app.LessonTypeVideo
		}
		afterLesson = &app.MoveLessonAfterLesson{
			ID:   request.Body.AfterLesson.Id,
			Type: t,
		}
	}
	var lessonType app.LessonType
	switch request.Body.Type {
	case course.LessonTypeTestLesson:
		lessonType = app.LessonTypeTest
	case course.LessonTypeVideoLesson:
		lessonType = app.LessonTypeVideo
	}
	cmd := &app.MoveLesson{
		LessonID:    request.LessonId,
		LessonType:  lessonType,
		Afterlesson: afterLesson,
		SectionID:   request.Body.SectionId,
	}
	err := h.App.Cmds.MoveLesson.Handle(ctx, cmd)
	if err != nil {
		return nil, err
	}
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetLessonProgress(ctx context.Context, request course.GetLessonProgressRequestObject) (course.GetLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) SaveLessonProgress(ctx context.Context, request course.SaveLessonProgressRequestObject) (course.SaveLessonProgressResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CreateTest(ctx context.Context, request course.CreateTestRequestObject) (course.CreateTestResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) GetUploadVideoLessonUrl(ctx context.Context, request course.GetUploadVideoLessonUrlRequestObject) (course.GetUploadVideoLessonUrlResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) CreateSection(ctx context.Context, request course.CreateSectionRequestObject) (course.CreateSectionResponseObject, error) {
	return nil, errs.Unimplemented
}

func (h *StrictHandler) DeleteSection(ctx context.Context, request course.DeleteSectionRequestObject) (course.DeleteSectionResponseObject, error) {
	return nil, errs.Unimplemented
}
