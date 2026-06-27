package domain_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/blog/domain"
	"github.com/egolia-uit/egolia/internal/blog/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewPost(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		id := uuid.New()
		authorID := "author-1"
		title := "Test Title"
		content := "Test Content"
		tags := []string{"test", "golang"}

		post, err := domain.NewPost(id, authorID, title, content, tags)

		require.NoError(t, err)
		assert.Equal(t, id, post.ID())
		assert.Equal(t, authorID, post.AuthorID())
		assert.Equal(t, title, post.Title())
		assert.Equal(t, content, post.Content())
		assert.Equal(t, tags, post.Tags())
		assert.Equal(t, 0, post.CommentCount())
		assert.WithinDuration(t, time.Now(), post.CreatedAt(), 2*time.Second)
	})

	t.Run("missing title", func(t *testing.T) {
		post, err := domain.NewPost(uuid.New(), "author-1", "", "content", nil)
		require.Error(t, err)
		assert.Nil(t, post)
		assert.Equal(t, errs.CodeInvalid, err.(errs.Error).Code())
	})

	t.Run("missing content", func(t *testing.T) {
		post, err := domain.NewPost(uuid.New(), "author-1", "title", "   ", nil)
		require.Error(t, err)
		assert.Nil(t, post)
		assert.Equal(t, errs.CodeInvalid, err.(errs.Error).Code())
	})
}

func TestPost_CanUserEdit(t *testing.T) {
	post := domain.UnmarshalPost(uuid.New(), "author-1", "title", "content", nil, 0, time.Now())

	t.Run("author can edit", func(t *testing.T) {
		err := post.CanUserEdit("author-1", []string{"user"})
		assert.NoError(t, err)
	})

	t.Run("admin can edit", func(t *testing.T) {
		err := post.CanUserEdit("author-2", []string{"admin"})
		assert.NoError(t, err)
	})

	t.Run("other user cannot edit", func(t *testing.T) {
		err := post.CanUserEdit("author-2", []string{"user"})
		assert.Equal(t, errs.CodeForbidden, err.(errs.Error).Code())
	})
}

func TestPost_IncrementCommentCount(t *testing.T) {
	post := domain.UnmarshalPost(uuid.New(), "author-1", "title", "content", nil, 0, time.Now())

	post.IncrementCommentCount()
	assert.Equal(t, 1, post.CommentCount())

	post.IncrementCommentCount()
	assert.Equal(t, 2, post.CommentCount())
}

func TestPost_DecrementCommentCount(t *testing.T) {
	post := domain.UnmarshalPost(uuid.New(), "author-1", "title", "content", nil, 5, time.Now())

	post.DecrementCommentCount(2)
	assert.Equal(t, 3, post.CommentCount())

	post.DecrementCommentCount(10)
	assert.Equal(t, 0, post.CommentCount())
}
