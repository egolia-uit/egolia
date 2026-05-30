package app_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestReplyOnLessonCommentHandler_Handle(t *testing.T) {
	t.Parallel()

	originCommentID := uuid.New()
	lessonID := uuid.New()
	userID := "user-2"

	validCmd := &app.ReplyOnLessonComment{
		OriginCommentID: originCommentID,
		UserID:          userID,
		Content:         "Thanks for the feedback!",
	}

	tests := []struct {
		name       string
		cmd        *app.ReplyOnLessonComment
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "valid reply saves successfully",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				originComment := domain.UnmarshalLessonComment(
					originCommentID, "user-1", lessonID, "Great lesson!", time.Now(), nil, nil,
				)
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Get", mock.Anything, domain.LessonCommentRepoGet{ID: originCommentID}).Return(originComment, nil)
				lessonCommentRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "parent comment not found returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Get", mock.Anything, domain.LessonCommentRepoGet{ID: originCommentID}).Return(nil, nil)
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
			handler := app.NewReplyOnLessonCommentHandler(uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
