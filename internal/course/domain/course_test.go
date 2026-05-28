package domain_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func newCourseWithTestLesson(t *testing.T) (*domain.Course, *domain.TestLesson) {
	t.Helper()

	course, err := domain.NewCourse(uuid.New(), "Go Basics", "instructor-1", 1000, "overview", "intro-video")
	require.NoError(t, err)

	lesson := domain.NewTestLesson(
		uuid.New(),
		"Quiz",
		domain.QuestionTypeSingleChoice,
		[]*domain.TestQuestion{
			domain.NewTestQuestion(
				uuid.New(),
				"Question?",
				[]*domain.TestAnswer{
					domain.NewTestAnswer(uuid.New(), "A", true),
					domain.NewTestAnswer(uuid.New(), "B", false),
				},
			),
		},
	)
	section := domain.NewSection(uuid.New(), "Section", nil)
	section.AddLesson(lesson)
	course.AddSection(section)

	return course, lesson
}

func firstTestLesson(t *testing.T, course *domain.Course) *domain.TestLesson {
	t.Helper()

	require.NotEmpty(t, course.Sections())
	require.NotEmpty(t, course.Sections()[0].Lessons())

	lesson, ok := course.Sections()[0].Lessons()[0].(*domain.TestLesson)
	require.True(t, ok)
	return lesson
}

func TestCreateDraftVersionRegeneratesTestQuestionAndAnswerIDs(t *testing.T) {
	t.Parallel()

	original, originalLesson := newCourseWithTestLesson(t)
	originalQuestion := originalLesson.GetQuestions()[0]
	originalAnswer := originalQuestion.Answers[0]

	draft := original.CreateDraftVersion()
	draftLesson := firstTestLesson(t, draft)
	draftQuestion := draftLesson.GetQuestions()[0]
	draftAnswer := draftQuestion.Answers[0]

	require.NotEqual(t, originalLesson.ID(), draftLesson.ID())
	require.NotEqual(t, originalQuestion.ID, draftQuestion.ID)
	require.NotEqual(t, originalAnswer.ID, draftAnswer.ID)
	require.Equal(t, originalQuestion.Question, draftQuestion.Question)
	require.Equal(t, originalAnswer.Content, draftAnswer.Content)
}

func TestMergeChangedTestLessonDoesNotReuseDraftChildIDs(t *testing.T) {
	t.Parallel()

	original, originalLesson := newCourseWithTestLesson(t)
	originalLessonID := originalLesson.ID()
	originalQuestionID := originalLesson.GetQuestions()[0].ID

	draft := original.CreateDraftVersion()
	draftLesson := firstTestLesson(t, draft)
	draftQuestion := domain.NewTestQuestion(
		uuid.New(),
		"Changed question?",
		[]*domain.TestAnswer{
			domain.NewTestAnswer(uuid.New(), "Changed answer", true),
		},
	)
	draftLesson.SetQuestions([]*domain.TestQuestion{draftQuestion})

	_, err := original.Merge(draft)
	require.NoError(t, err)

	mergedLesson := firstTestLesson(t, original)
	mergedQuestion := mergedLesson.GetQuestions()[0]
	mergedAnswer := mergedQuestion.Answers[0]

	require.Equal(t, originalLessonID, mergedLesson.ID())
	require.NotEqual(t, originalQuestionID, mergedQuestion.ID)
	require.NotEqual(t, draftQuestion.ID, mergedQuestion.ID)
	require.NotEqual(t, draftQuestion.Answers[0].ID, mergedAnswer.ID)
	require.Equal(t, draftQuestion.Question, mergedQuestion.Question)
	require.Equal(t, draftQuestion.Answers[0].Content, mergedAnswer.Content)
}

func TestMergeTitleOnlyTestLessonChangeKeepsOriginalQuestionIDs(t *testing.T) {
	t.Parallel()

	original, originalLesson := newCourseWithTestLesson(t)
	originalQuestionID := originalLesson.GetQuestions()[0].ID
	originalAnswerID := originalLesson.GetQuestions()[0].Answers[0].ID

	draft := original.CreateDraftVersion()
	draftLesson := firstTestLesson(t, draft)
	draftLesson.SetTitle("Renamed Quiz")

	_, err := original.Merge(draft)
	require.NoError(t, err)

	mergedLesson := firstTestLesson(t, original)
	require.Equal(t, "Renamed Quiz", mergedLesson.Title())
	require.Equal(t, originalQuestionID, mergedLesson.GetQuestions()[0].ID)
	require.Equal(t, originalAnswerID, mergedLesson.GetQuestions()[0].Answers[0].ID)
}
