package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeLessonNotFound Code = "lessonNotFound"
)

type LessonNotFound struct {
	ID uuid.UUID
	Err
}

func NewLessonNotFound(id uuid.UUID, err error) *LessonNotFound {
	return &LessonNotFound{
		ID: id,
		Err: Err{
			message: fmt.Sprintf("lesson with ID %s not found", id),
			code:    CodeLessonNotFound,
			err:     err,
		},
	}
}
