package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
	"github.com/google/uuid"
)

type UpdateReview struct {
	ReviewID uuid.UUID
	ActorID  string
	Comment  string
	Rating   int32
}

type UpdateReviewHandler struct {
	reviewPolicySvc *domain.ReviewPolicySvc
	uow             domain.UnitOfWork
}

func NewUpdateReviewHandler(reviewPolicySvc *domain.ReviewPolicySvc, uow domain.UnitOfWork) *UpdateReviewHandler {
	return &UpdateReviewHandler{
		reviewPolicySvc: reviewPolicySvc,
		uow:             uow,
	}
}

var _ commonhandler.Cmd[UpdateReview] = (*UpdateReviewHandler)(nil)

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
