package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const CodePostNotFound Code = "postNotFound"

type PostNotFoundErr struct {
	Err
	ID uuid.UUID
}

func NewPostNotFoundErr(id uuid.UUID) *PostNotFoundErr {
	return &PostNotFoundErr{
		Err: Err{
			message: fmt.Sprintf("post with id %s not found", id),
			code:    CodePostNotFound,
		},
		ID: id,
	}
}
