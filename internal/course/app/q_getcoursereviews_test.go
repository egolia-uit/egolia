package app_test

import (
	"errors"
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetCourseReviewsHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetCourseReviewsReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> returns paginated reviews",
			setup: func(t *testing.T) *app.MockGetCourseReviewsReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseReviewsReadModel(t)
				mockRead.EXPECT().GetCourseReviews(ctx, mock.MatchedBy(func(q *app.GetCourseReviews) bool {
					return q.CourseID == courseID && q.Paginate.Page == 1 && q.Paginate.Limit == 10
				})).Return(&app.Paginated[app.Review]{
					Data: []app.Review{
						{ID: uuid.New(), CourseID: courseID, Rating: 5, Comment: "Great!", UserID: "", CreatedAt: time.Time{}},
					},
					Pagination: app.Pagination{Page: 1, Limit: 10, Total: 1, TotalPages: 1, HasNext: false, HasPrev: false},
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "empty -> empty paginated list",
			setup: func(t *testing.T) *app.MockGetCourseReviewsReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseReviewsReadModel(t)
				mockRead.EXPECT().GetCourseReviews(ctx, mock.MatchedBy(func(q *app.GetCourseReviews) bool {
					return q.CourseID == courseID && q.Paginate.Page == 1 && q.Paginate.Limit == 10
				})).Return(&app.Paginated[app.Review]{
					Data:       []app.Review{},
					Pagination: app.Pagination{Page: 1, Limit: 10, Total: 0, TotalPages: 0, HasNext: false, HasPrev: false},
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "error -> propagated",
			setup: func(t *testing.T) *app.MockGetCourseReviewsReadModel {
				t.Helper()
				mockRead := app.NewMockGetCourseReviewsReadModel(t)
				mockRead.EXPECT().GetCourseReviews(ctx, mock.MatchedBy(func(q *app.GetCourseReviews) bool {
					return q.CourseID == courseID && q.Paginate.Page == 1 && q.Paginate.Limit == 10
				})).Return(nil, errors.New("db error"))
				return mockRead
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetCourseReviewsHandler(mockRead)
			rating := 5
			result, err := handler.Handle(ctx, &app.GetCourseReviews{
				CourseID: courseID,
				Paginate: app.PaginationParams{Page: 1, Limit: 10},
				Rating:   &rating,
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
