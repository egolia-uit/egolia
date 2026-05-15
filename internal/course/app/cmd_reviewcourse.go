package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
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
	reviewPolicySvc *domain.ReviewPolicySvc
	uow             domain.UnitOfWork
}

func NewReviewCourseHandler(reviewPolicySvc *domain.ReviewPolicySvc, uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) ReviewCourseCmd {
	handler := &ReviewCourseHandler{
		reviewPolicySvc: reviewPolicySvc,
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

		hasEnrolled, err := repoRegistry.Enrollment().ExistsByCourseAndLearner(ctx, cmd.CourseID, cmd.ActorID)
		if err != nil {
			return err
		}
		if !hasEnrolled {
			return errs.NewInvalid("learner has not enrolled in this course")
		}

		hasReviewed, err := repoRegistry.Review().ExistsByCourseAndLearner(ctx, cmd.CourseID, cmd.ActorID)
		if err != nil {
			return err
		}
		if hasReviewed {
			return errs.NewInvalid("learner has already reviewed this course")
		}

		err = h.reviewPolicySvc.Handle(*course, hasEnrolled, hasReviewed)
		if err != nil {
			return err
		}
		review := domain.NewReview(uuid.New(), course.ID(), cmd.ActorID, int(cmd.Rating), cmd.Comment)

		return repoRegistry.Review().Save(ctx, review)
	})
}
