package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestGetLessonCommentsHandler(t *testing.T) {
	t.Parallel()

	lessonID := uuid.New()

	tests := []struct {
		name    string
		setup   func(t *testing.T) *app.MockGetLessonCommentsReadModel
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "found -> returns comments",
			setup: func(t *testing.T) *app.MockGetLessonCommentsReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonCommentsReadModel(t)
				mockRead.EXPECT().GetLessonComments(ctx, &app.GetLessonComments{LessonID: lessonID}).Return(
					[]*app.LessonComment{{ID: uuid.New(), Content: "Great lesson!"}},
					nil,
				)
				return mockRead
			},
			wantErr: require.NoError,
		},
		{
			name: "empty -> empty list",
			setup: func(t *testing.T) *app.MockGetLessonCommentsReadModel {
				t.Helper()
				mockRead := app.NewMockGetLessonCommentsReadModel(t)
				mockRead.EXPECT().GetLessonComments(ctx, &app.GetLessonComments{LessonID: lessonID}).Return(
					[]*app.LessonComment{}, nil,
				)
				return mockRead
			},
			wantErr: require.NoError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead := tc.setup(t)
			handler := app.NewGetLessonCommentsHandler(mockRead)
			result, err := handler.Handle(ctx, &app.GetLessonComments{LessonID: lessonID})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
