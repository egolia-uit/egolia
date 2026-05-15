package app

import (
	"context"
	"log/slog"

	"github.com/google/uuid"
)

type GetCourseReviews struct {
	CourseID uuid.UUID
	Paginate PaginationParams
	Rating   *int
}

type GetCourseReviewsQuery Query[GetCourseReviews, *Paginated[Review]]

type GetCourseReviewsHandler struct {
	readModel GetCourseReviewsReadModel
}

func NewGetCourseReviewsHandler(readModel GetCourseReviewsReadModel, logger *slog.Logger, tracer Tracer) GetCourseReviewsQuery {
	handler := &GetCourseReviewsHandler{
		readModel: readModel,
	}
	return NewQSpan(NewQLog(handler, logger), tracer)
}

var _ Query[GetCourseReviews, *Paginated[Review]] = (*GetCourseReviewsHandler)(nil)

func (h *GetCourseReviewsHandler) Handle(ctx context.Context, query *GetCourseReviews) (*Paginated[Review], error) {
	return h.readModel.GetCourseReviews(ctx, query)
}
