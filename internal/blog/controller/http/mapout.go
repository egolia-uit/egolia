package http

import (
	"github.com/egolia-uit/egolia/internal/blog/app"
	"github.com/egolia-uit/egolia/pkg/api/blog"
	"github.com/oapi-codegen/runtime/types"
)

func postToDTO(p *app.Post) blog.Post {
	id := (types.UUID)(p.ID)
	return blog.Post{
		Id:           &id,
		AuthorId:     &p.AuthorID,
		Title:        p.Title,
		Content:      p.Content,
		Tags:         p.Tags,
		CommentCount: &p.CommentCount,
		CreatedAt:    &p.CreatedAt,
	}
}

func commentToDTO(c *app.Comment) blog.Comment {
	id := (types.UUID)(c.ID)
	postID := (types.UUID)(c.PostID)
	var parentCommentID *types.UUID
	if c.ParentCommentID != nil {
		pcid := (types.UUID)(*c.ParentCommentID)
		parentCommentID = &pcid
	}
	return blog.Comment{
		Id:              &id,
		PostId:          &postID,
		AuthorId:        &c.AuthorID,
		Content:         c.Content,
		ParentCommentId: parentCommentID,
		CreatedAt:       &c.CreatedAt,
	}
}
