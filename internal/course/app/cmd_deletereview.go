package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type DeleteReview struct {
	ReviewID uuid.UUID
	ActorID  string
}

type DeleteReviewHandler struct {
	reviewPolicySvc *domain.ReviewPolicySvc
	uow             domain.UnitOfWork
}

func NewDeleteReviewHandler(reviewPolicySvc *domain.ReviewPolicySvc, uow domain.UnitOfWork) *DeleteReviewHandler {
	return &DeleteReviewHandler{
		reviewPolicySvc: reviewPolicySvc,
		uow:             uow,
	}
}

var _ commonhandler.Cmd[DeleteReview] = (*DeleteReviewHandler)(nil)

func (h *DeleteReviewHandler) Handle(ctx context.Context, cmd *DeleteReview) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		return repoRegistry.Review().Delete(ctx, cmd.ReviewID)
	})
}
