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

func TestNewComment(t *testing.T) {
	t.Run("success without parent", func(t *testing.T) {
		id := uuid.New()
		postID := uuid.New()
		authorID := "author-1"
		content := "Test Comment"

		comment, err := domain.NewComment(id, postID, authorID, content, nil)

		require.NoError(t, err)
		assert.Equal(t, id, comment.ID())
		assert.Equal(t, postID, comment.PostID())
		assert.Nil(t, comment.ParentCommentID())
		assert.Equal(t, authorID, comment.AuthorID())
		assert.Equal(t, content, comment.Content())
		assert.WithinDuration(t, time.Now(), comment.CreatedAt(), 2*time.Second)
	})

	t.Run("success with parent", func(t *testing.T) {
		parentID := uuid.New()
		comment, err := domain.NewComment(uuid.New(), uuid.New(), "author-1", "Test Comment", &parentID)
		require.NoError(t, err)
		assert.Equal(t, &parentID, comment.ParentCommentID())
	})

	t.Run("missing content", func(t *testing.T) {
		comment, err := domain.NewComment(uuid.New(), uuid.New(), "author-1", "   ", nil)
		require.Error(t, err)
		assert.Nil(t, comment)
		assert.Equal(t, errs.CodeInvalid, err.(errs.Error).Code())
	})
}

func TestComment_CanUserEdit(t *testing.T) {
	comment := domain.UnmarshalComment(uuid.New(), uuid.New(), "author-1", "content", nil, time.Now())

	t.Run("author can edit", func(t *testing.T) {
		err := comment.CanUserEdit("author-1", []string{"user"})
		assert.NoError(t, err)
	})

	t.Run("admin can edit", func(t *testing.T) {
		err := comment.CanUserEdit("author-2", []string{"admin"})
		assert.NoError(t, err)
	})

	t.Run("other user cannot edit", func(t *testing.T) {
		err := comment.CanUserEdit("author-2", []string{"user"})
		assert.Equal(t, errs.CodeForbidden, err.(errs.Error).Code())
	})
}
