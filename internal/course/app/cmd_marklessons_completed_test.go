package app_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestMarkLessonAsCompletedHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	learnerID := "learner-1"
	lessonID := uuid.New()
	sectionID := uuid.New()

	t.Run("video lesson with sufficient watch -> completed and saved", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		duration := 100 * time.Second
		videoLesson := domain.NewVideoLesson(lessonID, "Video Lesson", "key", duration)
		section.AddLesson(videoLesson)
		course.AddSection(section)

		watched := 85.0 // 85% of 100s >= 80%
		progress := domain.NewLessonProgressVideo(uuid.New(), learnerID, lessonID, &watched, time.Now())

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockProgress.EXPECT().GetByUserIDAndLesson(ctx, learnerID, lessonID).Return(progress, nil)
		mockProgress.EXPECT().Save(ctx, mock.MatchedBy(func(lp domain.LessonProgress) bool {
			return lp.IsCompleted()
		})).Return(nil)

		handler := app.NewMarkLessonAsCompletedHandler(uow)
		err = handler.Handle(ctx, &app.MarkLessonAsCompleted{
			UserID:   learnerID,
			CourseID: courseID,
			LessonID: lessonID,
		})
		require.NoError(t, err)
	})

	t.Run("video lesson insufficient watch -> no save", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		duration := 100 * time.Second
		videoLesson := domain.NewVideoLesson(lessonID, "Video Lesson", "key", duration)
		section.AddLesson(videoLesson)
		course.AddSection(section)

		watched := 50.0 // 50% of 100s < 80%
		progress := domain.NewLessonProgressVideo(uuid.New(), learnerID, lessonID, &watched, time.Now())

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockProgress.EXPECT().GetByUserIDAndLesson(ctx, learnerID, lessonID).Return(progress, nil)

		handler := app.NewMarkLessonAsCompletedHandler(uow)
		err = handler.Handle(ctx, &app.MarkLessonAsCompleted{
			UserID:   learnerID,
			CourseID: courseID,
			LessonID: lessonID,
		})
		require.NoError(t, err)
	})

	t.Run("test lesson -> immediately completed and saved", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		section.AddLesson(domain.NewTestLesson(lessonID, "Test Lesson", domain.QuestionTypeMultipleChoice, nil))
		course.AddSection(section)

		// Use LessonProgressTest which is not a *LessonProgressVideo
		progress := &domain.LessonProgressTest{}
		progress.LessonProgressBase = *domain.NewLessonProgressBase(uuid.New(), learnerID, lessonID)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockProgress.EXPECT().GetByUserIDAndLesson(ctx, learnerID, lessonID).Return(progress, nil)
		mockProgress.EXPECT().Save(ctx, mock.MatchedBy(func(lp domain.LessonProgress) bool {
			return lp.IsCompleted()
		})).Return(nil)

		handler := app.NewMarkLessonAsCompletedHandler(uow)
		err = handler.Handle(ctx, &app.MarkLessonAsCompleted{
			UserID:   learnerID,
			CourseID: courseID,
			LessonID: lessonID,
		})
		require.NoError(t, err)
	})

	t.Run("already completed -> no save", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockProgress := domain.NewMockLessonProgressRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().LessonProgress().Return(mockProgress)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)

		// Create already-completed progress
		base := domain.NewLessonProgressBase(uuid.New(), learnerID, lessonID)
		base.MarkAsCompleted()
		progress := &domain.LessonProgressTest{LessonProgressBase: *base}

		mockProgress.EXPECT().GetByUserIDAndLesson(ctx, learnerID, lessonID).Return(progress, nil)

		handler := app.NewMarkLessonAsCompletedHandler(uow)
		err = handler.Handle(ctx, &app.MarkLessonAsCompleted{
			UserID:   learnerID,
			CourseID: courseID,
			LessonID: lessonID,
		})
		require.NoError(t, err)
	})
}
