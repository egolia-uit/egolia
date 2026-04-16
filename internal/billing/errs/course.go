package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeCourseSvcInternal Code = "courseSvcInternal"
	CodeCourseNotFound    Code = "courseNotFound"
)

type CourseSvcInternalErr struct {
	Err
}

func NewCourseSvcInternalErr(err error) *CourseSvcInternalErr {
	return &CourseSvcInternalErr{
		Err: Err{
			message: "course service internal error",
			code:    CodeCourseSvcInternal,
			err:     err,
		},
	}
}

type CourseNotFoundErr struct {
	Err
	ID uuid.UUID
}

func NewCourseNotFoundErr(id uuid.UUID) *CourseNotFoundErr {
	return &CourseNotFoundErr{
		Err: Err{
			message: fmt.Sprintf("course with id %s not found", id),
			code:    CodeCourseNotFound,
		},
		ID: id,
	}
}
