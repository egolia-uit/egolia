package app_test

import (
	"context"
	"testing"

	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestCreatePostHandler_Handle(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		repo := domain.NewMockPostRepo(t)
		repoRegistry := domain.NewMockRepoRegistry(t)
		repoRegistry.On("Post").Return(repo)

		uow := domain.NewMockUnitOfWork(t)
		uow.On("Execute", mock.Anything, mock.AnythingOfType("func(domain.RepoRegistry) error")).
			Run(func(args mock.Arguments) {
				fn := args.Get(1).(func(domain.RepoRegistry) error)
				err := fn(repoRegistry)
				require.NoError(t, err)
			}).
			Return(nil)

		repo.On("Save", mock.Anything, mock.MatchedBy(func(p *domain.Post) bool {
			return p.Title() == "Test Title" && p.Content() == "Test Content"
		})).Return(nil)

		handler := app.NewCreatePostHandler(uow)

		cmd := &app.CreatePost{
			ID:       uuid.New(),
			AuthorID: "author-1",
			Title:    "Test Title",
			Content:  "Test Content",
			Tags:     []string{"tag1"},
		}

		err := handler.Handle(context.Background(), cmd)
		require.NoError(t, err)
		repo.AssertExpectations(t)
		uow.AssertExpectations(t)
	})

	t.Run("invalid parameters", func(t *testing.T) {
		handler := app.NewCreatePostHandler(nil)

		cmd := &app.CreatePost{
			ID:       uuid.New(),
			AuthorID: "author-1",
			Title:    "", // invalid title
			Content:  "Test Content",
			Tags:     []string{"tag1"},
		}

		err := handler.Handle(context.Background(), cmd)
		assert.Equal(t, errs.CodeInvalid, err.(errs.Error).Code())
	})
}
