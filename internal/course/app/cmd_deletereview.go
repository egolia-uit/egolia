package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type DeleteReview struct {
	ReviewID uuid.UUID
	ActorID  string
}

type DeleteReviewCmd Cmd[DeleteReview]

type DeleteReviewHandler struct {
	reviewPolicySvc *domain.ReviewPolicySvc
	uow             domain.UnitOfWork
}

func NewDeleteReviewHandler(reviewPolicySvc *domain.ReviewPolicySvc, uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) DeleteReviewCmd {
	handler := &DeleteReviewHandler{
		reviewPolicySvc: reviewPolicySvc,
		uow:             uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[DeleteReview] = (*DeleteReviewHandler)(nil)

func (h *DeleteReviewHandler) Handle(ctx context.Context, cmd *DeleteReview) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		return repoRegistry.Review().Delete(ctx, cmd.ReviewID)
	})
}
