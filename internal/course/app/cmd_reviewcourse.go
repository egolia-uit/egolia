package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type ReviewCourse struct {
	CourseID uuid.UUID
	ActorID  string
	Comment  string
	Rating   int32
}

type ReviewCourseCmd Cmd[ReviewCourse]

type ReviewCourseHandler struct {
	reviewCourseSvc *domain.ReviewCourseSvc
	uow             domain.UnitOfWork
}

func NewReviewCourseHandler(reviewCourseSvc *domain.ReviewCourseSvc, uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) ReviewCourseCmd {
	handler := &ReviewCourseHandler{
		reviewCourseSvc: reviewCourseSvc,
		uow:             uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[ReviewCourse] = (*ReviewCourseHandler)(nil)

func (h *ReviewCourseHandler) Handle(ctx context.Context, cmd *ReviewCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, true)
		if err != nil {
			return err
		}

		review, err := h.reviewCourseSvc.Handle(ctx, &domain.ReviewCourse{
			Course:  course,
			ActorID: cmd.ActorID,
			Comment: cmd.Comment,
			Rating:  int(cmd.Rating),
		})
		if err != nil {
			return err
		}

		return repoRegistry.Review().Save(review)
	})
}
