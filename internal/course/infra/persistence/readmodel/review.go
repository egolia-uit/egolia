package readmodel

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
)

type ReviewReadRepo struct {
	db *gorm.DB
}

func NewReviewReadRepo(db *gorm.DB) *ReviewReadRepo {
	return &ReviewReadRepo{db: db}
}

var _ app.GetCourseReviewsReadModel = (*ReviewReadRepo)(nil)

func (r *ReviewReadRepo) GetCourseReviews(ctx context.Context, params *app.GetCourseReviews) (*app.Paginated[app.Review], error) {
	q := r.db.WithContext(ctx).Model(new(model.Review)).
		Where("course_id = ?", params.CourseID)

	if params.Rating != nil {
		q = q.Where("rating = ?", *params.Rating)
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	offset := (params.Paginate.Page - 1) * params.Paginate.Limit
	var ms []model.Review
	if err := q.Offset(offset).Limit(params.Paginate.Limit).Find(&ms).Error; err != nil {
		return nil, err
	}

	reviews := make([]app.Review, 0, len(ms))
	for i := range ms {
		reviews = append(reviews, app.Review{
			ID:        ms[i].ID,
			CourseID:  ms[i].CourseID,
			UserID:    ms[i].UserID,
			Rating:    ms[i].Rating,
			Comment:   ms[i].Comment,
			CreatedAt: ms[i].CreatedAt,
		})
	}
	return &app.Paginated[app.Review]{
		Data:       reviews,
		Pagination: buildPagination(params.Paginate.Page, params.Paginate.Limit, int(total)),
	}, nil
}
