package app_test

import (
	"errors"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestGetLessonDetailHandler(t *testing.T) {
	t.Parallel()

	lessonID := uuid.New()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetLessonDetailReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "video found -> GetLessonDetailReadModel.GetVideoLesson returns lesson",
			setup: func(t *testing.T) *app.MockGetLessonDetailReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonDetailReadModel(t)
				mockRead.EXPECT().GetVideoLessonDetail(ctx, &app.GetLessonDetail{LessonID: lessonID}).Return(
					&app.VideoLesson{LessonBase: app.LessonBase{ID: lessonID, Title: "Video Lesson", LessonType: app.LessonTypeVideo}, VideoURL: "", Duration: 0},
					nil,
				)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "video not found, test found -> GetTestLesson returns lesson",
			setup: func(t *testing.T) *app.MockGetLessonDetailReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonDetailReadModel(t)
				mockRead.EXPECT().GetVideoLessonDetail(ctx, &app.GetLessonDetail{LessonID: lessonID}).Return(
					nil, errs.NewLessonNotFound(lessonID, nil),
				)
				mockRead.EXPECT().GetTestLessonDetail(ctx, &app.GetLessonDetail{LessonID: lessonID}).Return(
					&app.TestLesson{LessonBase: app.LessonBase{ID: lessonID, Title: "Test Lesson", LessonType: app.LessonTypeTest}, QuestionType: "", Questions: nil},
					nil,
				)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "neither found -> error",
			setup: func(t *testing.T) *app.MockGetLessonDetailReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonDetailReadModel(t)
				mockRead.EXPECT().GetVideoLessonDetail(ctx, &app.GetLessonDetail{LessonID: lessonID}).Return(
					nil, errs.NewLessonNotFound(lessonID, nil),
				)
				mockRead.EXPECT().GetTestLessonDetail(ctx, &app.GetLessonDetail{LessonID: lessonID}).Return(
					nil, errors.New("not found"),
				)
				return mockRead
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetLessonDetailHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetLessonDetail{LessonID: lessonID})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
