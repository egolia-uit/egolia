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

func TestDeleteLessonCommentHandler_Handle(t *testing.T) {
	t.Parallel()

	commentID := uuid.New()
	lessonID := uuid.New()
	userID := "user-1"

	validCmd := &app.DeleteLessonComment{
		CommentID: commentID,
		UserID:    userID,
		UserRoles: nil,
	}

	tests := []struct {
		name       string
		cmd        *app.DeleteLessonComment
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "valid deletes comment and saves",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				comment := domain.UnmarshalLessonComment(
					commentID, userID, lessonID, "Great lesson!", time.Now(), nil, nil,
				)
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Get", mock.Anything, domain.LessonCommentRepoGet{ID: commentID}).Return(comment, nil)
				lessonCommentRepo.On("DeleteReplies", mock.Anything, commentID).Return(nil)
				lessonCommentRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "comment not found returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Get", mock.Anything, domain.LessonCommentRepoGet{ID: commentID}).Return(nil, nil)
			},
			wantErr: true,
		},
		{
			name: "user not author returns unauthorized error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				comment := domain.UnmarshalLessonComment(
					commentID, "other-user", lessonID, "Great lesson!", time.Now(), nil, nil,
				)
				lessonCommentRepo := domain.NewMockLessonCommentRepo(t)
				reg.On("LessonComment").Return(lessonCommentRepo)
				lessonCommentRepo.On("Get", mock.Anything, domain.LessonCommentRepoGet{ID: commentID}).Return(comment, nil)
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
			handler := app.NewDeleteLessonCommentHandler(uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
