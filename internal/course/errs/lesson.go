package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeLessonNotFound            Code = "lessonNotFound"
	CodeLessonGenerateOrderFailed Code = "lessonGenerateOrderFailed"
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

type LessonGenerateOrderFailed struct {
	prevOrder string
	nextOrder string
	Err
}

func NewLessonGenerateOrderFailed(prevOrder, nextOrder string, err error) *LessonGenerateOrderFailed {
	return &LessonGenerateOrderFailed{
		prevOrder: prevOrder,
		nextOrder: nextOrder,
		Err: Err{
			message: fmt.Sprintf("failed to generate order between %s and %s", prevOrder, nextOrder),
			code:    CodeLessonGenerateOrderFailed,
			err:     err,
		},
	}
}
