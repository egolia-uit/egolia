package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type UpdateReview struct {
	ReviewID uuid.UUID
	ActorID  string
	Comment  string
	Rating   int32
}

type UpdateReviewCmd Cmd[UpdateReview]

type UpdateReviewHandler struct {
	reviewPolicySvc *domain.ReviewPolicySvc
	uow             domain.UnitOfWork
}

func NewUpdateReviewHandler(reviewPolicySvc *domain.ReviewPolicySvc, uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) UpdateReviewCmd {
	handler := &UpdateReviewHandler{
		reviewPolicySvc: reviewPolicySvc,
		uow:             uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[UpdateReview] = (*UpdateReviewHandler)(nil)

func (h *UpdateReviewHandler) Handle(ctx context.Context, cmd *UpdateReview) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		review, err := repoRegistry.Review().GetByID(ctx, cmd.ReviewID)
		if err != nil {
			return err
		}

		review.Update(cmd.Comment, int(cmd.Rating))

		return repoRegistry.Review().Save(ctx, review)
	})
}
