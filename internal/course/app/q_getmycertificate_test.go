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

func TestGetMyCertificatesHandler(t *testing.T) {
	t.Parallel()

	userID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetMyCertificatesReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> returns list",
			setup: func(t *testing.T) *app.MockGetMyCertificatesReadModel {
				t.Helper()
				mockRead := app.NewMockGetMyCertificatesReadModel(t)
				mockRead.EXPECT().GetMyCertificates(ctx, userID, mock.Anything, mock.Anything).Return(&app.Paginated[app.Certificate]{
					Data:       []app.Certificate{{ID: uuid.New(), CourseID: uuid.UUID{}, UserID: "", CreatedAt: time.Time{}}},
					Pagination: app.Pagination{Page: 0, Limit: 0, Total: 0, TotalPages: 0, HasNext: false, HasPrev: false},
				}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "empty -> empty list",
			setup: func(t *testing.T) *app.MockGetMyCertificatesReadModel {
				t.Helper()
				mockRead := app.NewMockGetMyCertificatesReadModel(t)
				mockRead.EXPECT().GetMyCertificates(ctx, userID, mock.Anything, mock.Anything).Return(&app.Paginated[app.Certificate]{Data: []app.Certificate{}, Pagination: app.Pagination{Page: 0, Limit: 0, Total: 0, TotalPages: 0, HasNext: false, HasPrev: false}}, nil)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "error -> propagated",
			setup: func(t *testing.T) *app.MockGetMyCertificatesReadModel {
				t.Helper()
				mockRead := app.NewMockGetMyCertificatesReadModel(t)
				mockRead.EXPECT().GetMyCertificates(ctx, userID, mock.Anything, mock.Anything).Return(nil, errors.New("db error"))
				return mockRead
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetMyCertificatesHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetMyCertificates{
				UserID:   userID,
				Paginate: app.PaginationParams{Page: 1, Limit: 10},
				Order:    nil,
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
