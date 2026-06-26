package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestCommentOnLessonHandler_Handle(t *testing.T) {
	t.Parallel()

	lessonID := uuid.New()
	userID := "user-1"

	validCmd := &app.CommentOnLesson{
		LessonID: lessonID,
		UserID:   userID,
		Content:  "Great lesson!",
	}

	tests := []struct {
		name       string
		cmd        *app.CommentOnLesson
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "valid comment saves successfully",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "save fails returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Save", mock.Anything, mock.Anything).Return(assert.AnError)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			uow, reg := withUow(t)
			if tt.setupMocks != nil {
				tt.setupMocks(t, uow, reg)
			}
			handler := app.NewCommentOnLessonHandler(uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
