package app_test

import (
	"errors"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestDeleteReviewHandler(t *testing.T) {
	t.Parallel()

	reviewID := uuid.New()

	t.Run("valid -> ReviewRepo.Delete called", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockReview := domain.NewMockReviewRepo(t)
		reg.EXPECT().Review().Return(mockReview)

		mockReview.EXPECT().Delete(ctx, reviewID).Return(nil)

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewDeleteReviewHandler(reviewSvc, uow)
		err := handler.Handle(ctx, &app.DeleteReview{
			ReviewID: reviewID,
			ActorID:  "learner-1",
		})
		require.NoError(t, err)
	})

	t.Run("review not found -> error", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockReview := domain.NewMockReviewRepo(t)
		reg.EXPECT().Review().Return(mockReview)

		mockReview.EXPECT().Delete(ctx, reviewID).Return(errors.New("not found"))

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewDeleteReviewHandler(reviewSvc, uow)
		err := handler.Handle(ctx, &app.DeleteReview{
			ReviewID: reviewID,
			ActorID:  "learner-1",
		})
		require.Error(t, err)
	})
}
