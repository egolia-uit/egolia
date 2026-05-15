package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeLessonCommentNotFound Code = "lessonCommentNotFound"
)

type LessonCommentNotFound struct {
	ID uuid.UUID
	Err
}

func NewLessonCommentNotFound(id uuid.UUID, err error) *LessonCommentNotFound {
	return &LessonCommentNotFound{
		ID: id,
		Err: Err{
			message: fmt.Sprintf("lesson comment with ID %s not found", id),
			code:    CodeLessonCommentNotFound,
			err:     err,
		},
	}
}
