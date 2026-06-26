package app_test

import (
	"errors"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestUpdateReviewHandler(t *testing.T) {
	t.Parallel()

	reviewID := uuid.New()

	t.Run("valid -> review updated and saved", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockReview := domain.NewMockReviewRepo(t)
		reg.EXPECT().Review().Return(mockReview)

		existingReview := domain.NewReview(reviewID, uuid.New(), "learner-1", 3, "OK")

		mockReview.EXPECT().GetByID(ctx, reviewID).Return(existingReview, nil)
		mockReview.EXPECT().Save(ctx, mock.MatchedBy(func(r *domain.Review) bool {
			return r.Rating() == 5 && r.Comment() == "Updated!"
		})).Return(nil)

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewUpdateReviewHandler(reviewSvc, uow)
		err := handler.Handle(ctx, &app.UpdateReview{
			ReviewID: reviewID,
			ActorID:  "learner-1",
			Comment:  "Updated!",
			Rating:   5,
		})
		require.NoError(t, err)
	})

	t.Run("review not found -> error", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockReview := domain.NewMockReviewRepo(t)
		reg.EXPECT().Review().Return(mockReview)

		mockReview.EXPECT().GetByID(ctx, reviewID).Return(nil, errors.New("not found"))

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewUpdateReviewHandler(reviewSvc, uow)
		err := handler.Handle(ctx, &app.UpdateReview{
			ReviewID: reviewID,
			ActorID:  "learner-1",
			Comment:  "Updated!",
			Rating:   5,
		})
		require.Error(t, err)
	})
}
