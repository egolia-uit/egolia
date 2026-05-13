package app

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type CreateVideoLesson struct {
	ID        uuid.UUID
	CourseID  uuid.UUID
	SectionID uuid.UUID
	Title     string
	VideoKey  string
	Duration  time.Duration
	UserID    string
}

type CreateTestLesson struct {
	ID           uuid.UUID
	CourseID     uuid.UUID
	SectionID    uuid.UUID
	Title        string
	QuestionType QuestionType
	Questions    []TestQuestion
	UserID       string
}

type CreateVideoLessonCmd = CreateVideoLesson

type CreateTestLessonCmd = CreateTestLesson

type CreateLessonCmd interface {
	Handle(ctx context.Context, cmd any) error
}

type createLessonCmd struct {
	video Cmd[CreateVideoLesson]
	test  Cmd[CreateTestLesson]
}

func NewCreateLessonCmd(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) CreateLessonCmd {
	videoHandler := &CreateVideoLessonHandler{
		uow: uow,
	}
	testHandler := &CreateTestLessonHandler{
		uow: uow,
	}

	videoCmd := NewCmdSpan(NewCmdLog(videoHandler, logger), tracer)
	testCmd := NewCmdSpan(NewCmdLog(testHandler, logger), tracer)

	return &createLessonCmd{
		video: videoCmd,
		test:  testCmd,
	}
}

func (c *createLessonCmd) Handle(ctx context.Context, cmd any) error {
	switch lesson := cmd.(type) {
	case *CreateVideoLesson:
		return c.video.Handle(ctx, lesson)
	case *CreateTestLesson:
		return c.test.Handle(ctx, lesson)
	default:
		return errors.New("unsupported lesson type")
	}
}

func convertTestQuestions(questions []TestQuestion) []*domain.TestQuestion {
	out := make([]*domain.TestQuestion, 0, len(questions))
	for i := range questions {
		question := questions[i]
		answers := make([]*domain.TestAnswer, 0, len(question.Answers))
		for j := range question.Answers {
			answer := question.Answers[j]
			answers = append(answers, &domain.TestAnswer{
				ID:        answer.ID,
				Content:   answer.Content,
				IsCorrect: answer.IsCorrect,
			})
		}
		out = append(out, &domain.TestQuestion{
			ID:       question.ID,
			Question: question.Question,
			Answers:  answers,
		})
	}
	return out
}

type CreateVideoLessonHandler struct {
	uow domain.UnitOfWork
}

func (h *CreateVideoLessonHandler) Handle(ctx context.Context, cmd *CreateVideoLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, true)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		section := course.GetSection(cmd.SectionID)
		if section == nil {
			return errs.NewSectionNotFound(cmd.SectionID)
		}

		section.AddLesson(domain.NewVideoLesson(cmd.ID, cmd.Title, cmd.VideoKey, cmd.Duration))

		return repoRegistry.Course().Save(ctx, course)
	})
}

type CreateTestLessonHandler struct {
	uow domain.UnitOfWork
}

func (h *CreateTestLessonHandler) Handle(ctx context.Context, cmd *CreateTestLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{ID: cmd.CourseID}, true)
		if err != nil {
			return err
		}

		if !course.CanInstructorEdit() {
			return errs.Unauthorized
		}

		section := course.GetSection(cmd.SectionID)
		if section == nil {
			return errs.NewSectionNotFound(cmd.SectionID)
		}

		section.AddLesson(domain.NewTestLesson(cmd.ID, cmd.Title, domain.QuestionType(cmd.QuestionType), convertTestQuestions(cmd.Questions)))

		return repoRegistry.Course().Save(ctx, course)
	})
}
