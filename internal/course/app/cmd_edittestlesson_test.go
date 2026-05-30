package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestEditTestLessonHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	sectionID := uuid.New()
	lessonID := uuid.New()

	t.Run("valid", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		testLesson := domain.NewTestLesson(lessonID, "Original Test", domain.QuestionTypeMultipleChoice, nil)
		section.AddLesson(testLesson)
		course.AddSection(section)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockCourse.EXPECT().Save(ctx, mock.Anything).Return(nil)

		handler := app.NewEditTestLessonHandler(uow)
		cmd := &app.EditTestLesson{
			CourseID:     courseID,
			SectionID:    sectionID,
			LessonID:     lessonID,
			UserID:       "user-1",
			Title:        "Updated Test",
			QuestionType: domain.QuestionTypeSingleChoice,
			Questions: []app.EditTestQuestion{
				{Question: "New Q", Answers: []app.EditTestAnswer{
					{Answer: "New A", IsCorrect: true},
				}},
			},
		}
		err = handler.Handle(ctx, cmd)
		require.NoError(t, err)
	})

	t.Run("lesson not found", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		reg.EXPECT().Course().Return(mockCourse)

		course, err := domain.NewCourse(courseID, "Test Course", "user-1", 0, "overview", "")
		require.NoError(t, err)
		section := domain.NewSection(sectionID, "Section 1", nil)
		course.AddSection(section)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)

		handler := app.NewEditTestLessonHandler(uow)
		cmd := &app.EditTestLesson{
			CourseID:     courseID,
			SectionID:    sectionID,
			LessonID:     lessonID,
			UserID:       "user-1",
			Title:        "Updated Test",
			QuestionType: domain.QuestionTypeSingleChoice,
			Questions:    nil,
		}
		err = handler.Handle(ctx, cmd)
		require.Error(t, err)
	})
}
