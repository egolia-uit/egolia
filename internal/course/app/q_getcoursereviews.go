package app

import (
	"context"

	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetCourseReviews struct {
	CourseID uuid.UUID
	Paginate PaginationParams
	Rating   *int
}

type GetCourseReviewsHandler struct {
	readModel GetCourseReviewsReadModel
}

func NewGetCourseReviewsHandler(readModel GetCourseReviewsReadModel) *GetCourseReviewsHandler {
	return &GetCourseReviewsHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetCourseReviews, *Paginated[Review]] = (*GetCourseReviewsHandler)(nil)

func (h *GetCourseReviewsHandler) Handle(ctx context.Context, query *GetCourseReviews) (*Paginated[Review], error) {
	return h.readModel.GetCourseReviews(ctx, query)
}
