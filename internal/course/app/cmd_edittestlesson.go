package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type EditTestLesson struct {
	CourseID     uuid.UUID
	SectionID    uuid.UUID
	LessonID     uuid.UUID
	UserID       string
	Title        string
	QuestionType domain.QuestionType
	Questions    []EditTestQuestion
}

type EditTestQuestion struct {
	Question string
	Answers  []EditTestAnswer
}

type EditTestAnswer struct {
	Answer    string
	IsCorrect bool
}

type EditTestLessonHandler struct {
	uow domain.UnitOfWork
}

func NewEditTestLessonHandler(
	uow domain.UnitOfWork,
) *EditTestLessonHandler {
	return &EditTestLessonHandler{
		uow: uow,
	}
}

var _ commonhandler.Cmd[EditTestLesson] = (*EditTestLessonHandler)(nil)

func (h *EditTestLessonHandler) Handle(ctx context.Context, cmd *EditTestLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}
		if course == nil {
			return errs.NewCourseNotFound(cmd.CourseID, nil)
		}

		// App layer làm nhiệm vụ map dữ liệu thành Domain entities
		domainQuestions := make([]*domain.TestQuestion, 0, len(cmd.Questions))
		for _, q := range cmd.Questions {
			domainAnswers := make([]*domain.TestAnswer, 0, len(q.Answers))
			for _, a := range q.Answers {
				domainAnswers = append(domainAnswers, domain.NewTestAnswer(
					uuid.New(), // Hoặc lấy truyền từ DTO nếu thiết kế cần giữ ID cũ
					a.Answer,
					a.IsCorrect,
				))
			}
			domainQuestions = append(domainQuestions, domain.NewTestQuestion(
				uuid.New(), // Hoặc lấy truyền từ DTO nếu thiết kế cần giữ ID cũ
				q.Question,
				domainAnswers,
			))
		}

		if err := course.EditTestLesson(ctx, cmd.SectionID, cmd.LessonID, cmd.UserID, cmd.Title, cmd.QuestionType, domainQuestions); err != nil {
			return err
		}
		return repoRegistry.Course().Save(ctx, course)
	})
}
