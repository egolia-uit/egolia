package app_test

import (
	"errors"
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/stretchr/testify/require"
)

func TestGetUploadVideoLessonURLHandler(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockObjectStorageSvc
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "valid -> ObjectStorageSvc returns upload URL",
			setup: func(t *testing.T) *app.MockObjectStorageSvc {
				t.Helper()
				mockSvc := app.NewMockObjectStorageSvc(t)
				mockSvc.EXPECT().GetUploadVideoLessonURL(ctx, &app.GetUploadVideoLessonURLParams{
					VideoFilename: "lesson-video.mp4",
				}).Return(&app.VideoLessonObject{
					UploadURL: "https://storage.example.com/upload/abc123",
					VideoKey:  "lessons/abc123.mp4",
					ExpiresAt: time.Time{},
				}, nil)
				return mockSvc
			},
			wantErr: require.NoError,
		},
		{
			name: "service error -> error propagated",
			setup: func(t *testing.T) *app.MockObjectStorageSvc {
				t.Helper()
				mockSvc := app.NewMockObjectStorageSvc(t)
				mockSvc.EXPECT().GetUploadVideoLessonURL(ctx, &app.GetUploadVideoLessonURLParams{
					VideoFilename: "lesson-video.mp4",
				}).Return(nil, errors.New("storage unavailable"))
				return mockSvc
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockSvc := tc.setup(t)
			handler := app.NewGetUploadVideoLessonURLHandler(mockSvc)
			result, err := handler.Handle(ctx, &app.GetUploadVideoLessonURL{
				VideoFilename: "lesson-video.mp4",
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
