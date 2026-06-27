package app_test

import (
	"context"
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestDeletePostHandler_Handle(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		postID := uuid.New()
		authorID := "author-1"
		post := domain.UnmarshalPost(postID, authorID, "Title", "Content", nil, 0, time.Now())

		repo := domain.NewMockPostRepo(t)
		repo.On("Get", mock.Anything, postID).Return(post, nil)
		repo.On("Delete", mock.Anything, postID).Return(nil)

		repoRegistry := domain.NewMockRepoRegistry(t)
		repoRegistry.On("Post").Return(repo)

		commentRepo := domain.NewMockCommentRepo(t)
		commentRepo.On("DeleteByPostID", mock.Anything, postID).Return(0, nil)
		repoRegistry.On("Comment").Return(commentRepo)

		uow := domain.NewMockUnitOfWork(t)
		uow.On("Execute", mock.Anything, mock.AnythingOfType("func(domain.RepoRegistry) error")).
			Run(func(args mock.Arguments) {
				fn := args.Get(1).(func(domain.RepoRegistry) error)
				err := fn(repoRegistry)
				require.NoError(t, err)
			}).
			Return(nil)

		handler := app.NewDeletePostHandler(uow)

		cmd := &app.DeletePost{
			PostID:     postID,
			ActorID:    authorID,
			ActorRoles: []string{"user"},
		}

		err := handler.Handle(context.Background(), cmd)
		require.NoError(t, err)
		repo.AssertExpectations(t)
		uow.AssertExpectations(t)
	})

	t.Run("admin can delete", func(t *testing.T) {
		postID := uuid.New()
		post := domain.UnmarshalPost(postID, "author-1", "Title", "Content", nil, 0, time.Now())

		repo := domain.NewMockPostRepo(t)
		repo.On("Get", mock.Anything, postID).Return(post, nil)
		repo.On("Delete", mock.Anything, postID).Return(nil)

		repoRegistry := domain.NewMockRepoRegistry(t)
		repoRegistry.On("Post").Return(repo)

		commentRepo := domain.NewMockCommentRepo(t)
		commentRepo.On("DeleteByPostID", mock.Anything, postID).Return(0, nil)
		repoRegistry.On("Comment").Return(commentRepo)

		uow := domain.NewMockUnitOfWork(t)
		uow.On("Execute", mock.Anything, mock.AnythingOfType("func(domain.RepoRegistry) error")).
			Run(func(args mock.Arguments) {
				fn := args.Get(1).(func(domain.RepoRegistry) error)
				err := fn(repoRegistry)
				require.NoError(t, err)
			}).
			Return(nil)

		handler := app.NewDeletePostHandler(uow)

		cmd := &app.DeletePost{
			PostID:     postID,
			ActorID:    "admin-user",
			ActorRoles: []string{"admin"},
		}

		err := handler.Handle(context.Background(), cmd)
		require.NoError(t, err)
		repo.AssertExpectations(t)
	})

	t.Run("forbidden", func(t *testing.T) {
		postID := uuid.New()
		post := domain.UnmarshalPost(postID, "author-1", "Title", "Content", nil, 0, time.Now())

		repo := domain.NewMockPostRepo(t)
		repo.On("Get", mock.Anything, postID).Return(post, nil)

		repoRegistry := domain.NewMockRepoRegistry(t)
		repoRegistry.On("Post").Return(repo)

		uow := domain.NewMockUnitOfWork(t)
		uow.On("Execute", mock.Anything, mock.AnythingOfType("func(domain.RepoRegistry) error")).
			Run(func(args mock.Arguments) {
				fn := args.Get(1).(func(domain.RepoRegistry) error)
				err := fn(repoRegistry)
				assert.Equal(t, errs.CodeForbidden, err.(errs.Error).Code())
			}).
			Return(errs.NewForbidden("forbidden"))

		handler := app.NewDeletePostHandler(uow)

		cmd := &app.DeletePost{
			PostID:     postID,
			ActorID:    "other-user",
			ActorRoles: []string{"user"},
		}

		err := handler.Handle(context.Background(), cmd)
		assert.Equal(t, errs.CodeForbidden, err.(errs.Error).Code())
	})
}
