package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const CodeCommentNotFound Code = "commentNotFound"

type CommentNotFoundErr struct {
	Err
	ID uuid.UUID
}

func NewCommentNotFoundErr(id uuid.UUID) *CommentNotFoundErr {
	return &CommentNotFoundErr{
		Err: Err{
			message: fmt.Sprintf("comment with id %s not found", id),
			code:    CodeCommentNotFound,
		},
		ID: id,
	}
}
