package errs

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	CodeCourseNotFound             Code = "courseNotFound"
	CodeCourseInvalid              Code = "courseInvalid"
	CodeCourseAlreadyExists        Code = "courseAlreadyExists"
	CodeCourseCannotModify         Code = "courseCannotModify"
	CodeCourseHasEnrollment        Code = "courseHasEnrollment"
	CodeCourseStatusInvalid        Code = "courseStatusInvalid"
	CodeSectionNotFound            Code = "sectionNotFound"
	CodeSectionInvalid             Code = "sectionInvalid"
	CodeInstructorPermissionDenied Code = "instructorPermissionDenied"
	CodeCourseNotApproved          Code = "courseNotApproved"
	CodeCourseAlreadyBookmarked    Code = "courseAlreadyBookmarked"
	CodeCourseNotPublished         Code = "courseNotPublished"
	CodeSectionTitleAlreadyExists  Code = "sectionTitleAlreadyExists"
)

type CourseNotFound struct {
	ID uuid.UUID
	Err
}

func NewCourseNotFound(id uuid.UUID, err error) *CourseNotFound {
	return &CourseNotFound{
		ID: id,
		Err: Err{
			message: fmt.Sprintf("course with ID %s not found", id),
			code:    CodeCourseNotFound,
			err:     err,
		},
	}
}

type CourseInvalid struct {
	Field string
	Err
}

func NewCourseInvalid(field, message string) *CourseInvalid {
	return &CourseInvalid{
		Field: field,
		Err: Err{
			message: fmt.Sprintf("course %s is invalid: %s", field, message),
			code:    CodeCourseInvalid,
		},
	}
}

type SectionTitleAlreadyExists struct {
	Title string
	Err
}

func NewSectionTitleAlreadyExists(title string) *SectionTitleAlreadyExists {
	return &SectionTitleAlreadyExists{
		Title: title,
		Err: Err{
			message: fmt.Sprintf("section with title %s already exists", title),
			code:    CodeSectionTitleAlreadyExists,
		},
	}
}

type CourseAlreadyExists struct {
	ID uuid.UUID
	Err
}

func NewCourseAlreadyExists(id uuid.UUID) *CourseAlreadyExists {
	return &CourseAlreadyExists{
		ID: id,
		Err: Err{
			message: fmt.Sprintf("course with ID %s already exists", id),
			code:    CodeCourseAlreadyExists,
		},
	}
}

type CourseCannotModify struct {
	ID     uuid.UUID
	Status string
	Err
}

func NewCourseCannotModify(id uuid.UUID, status string) *CourseCannotModify {
	return &CourseCannotModify{
		ID:     id,
		Status: status,
		Err: Err{
			message: fmt.Sprintf("course with ID %s has status %s and cannot be modified", id, status),
			code:    CodeCourseCannotModify,
		},
	}
}

type CourseHasEnrollment struct {
	ID uuid.UUID
	Err
}

func NewCourseHasEnrollment(id uuid.UUID) *CourseHasEnrollment {
	return &CourseHasEnrollment{
		ID: id,
		Err: Err{
			message: fmt.Sprintf("course with ID %s has enrolled learners and cannot be deleted", id),
			code:    CodeCourseHasEnrollment,
		},
	}
}

type CourseStatusInvalid struct {
	CurrentStatus string
	Action        string
	Err
}

func NewCourseStatusInvalid(currentStatus, action string) *CourseStatusInvalid {
	return &CourseStatusInvalid{
		CurrentStatus: currentStatus,
		Action:        action,
		Err: Err{
			message: fmt.Sprintf("cannot %s on course with status %s", action, currentStatus),
			code:    CodeCourseStatusInvalid,
		},
	}
}

type SectionNotFound struct {
	ID uuid.UUID
	Err
}

func NewSectionNotFound(id uuid.UUID) *SectionNotFound {
	return &SectionNotFound{
		ID: id,
		Err: Err{
			message: fmt.Sprintf("section with ID %s not found", id),
			code:    CodeSectionNotFound,
		},
	}
}

type SectionInvalid struct {
	Field string
	Err
}

func NewSectionInvalid(field, message string) *SectionInvalid {
	return &SectionInvalid{
		Field: field,
		Err: Err{
			message: fmt.Sprintf("section %s is invalid: %s", field, message),
			code:    CodeSectionInvalid,
		},
	}
}

type CourseNotPublished struct {
	CourseID uuid.UUID
	Err
}

func NewCourseNotPublished(courseID uuid.UUID) *CourseNotPublished {
	return &CourseNotPublished{
		CourseID: courseID,
		Err: Err{
			message: fmt.Sprintf("course with ID %s is not published", courseID),
			code:    CodeCourseNotPublished,
		},
	}
}

type CourseAlreadyBookmarked struct {
	CourseID uuid.UUID
	UserID   string
	Err
}

func NewCourseAlreadyBookmarked(courseID uuid.UUID, userID string) *CourseAlreadyBookmarked {
	return &CourseAlreadyBookmarked{
		CourseID: courseID,
		UserID:   userID,
		Err: Err{
			message: fmt.Sprintf("course with ID %s is already bookmarked by user %s", courseID, userID),
			code:    CodeCourseAlreadyBookmarked,
		},
	}
}

type InstructorPermissionDenied struct {
	InstructorID string
	CourseID     uuid.UUID
	Err
}

func NewInstructorPermissionDenied(instructorID string, courseID uuid.UUID) *InstructorPermissionDenied {
	return &InstructorPermissionDenied{
		InstructorID: instructorID,
		CourseID:     courseID,
		Err: Err{
			message: fmt.Sprintf("instructor %s is not authorized to modify course %s", instructorID, courseID),
			code:    CodeInstructorPermissionDenied,
		},
	}
}

type CourseNotApproved struct {
	ID     uuid.UUID
	Status string
	Err
}

func NewCourseNotApproved(id uuid.UUID, status string) *CourseNotApproved {
	return &CourseNotApproved{
		ID:     id,
		Status: status,
		Err: Err{
			message: fmt.Sprintf("course with ID %s must be approved but has status %s", id, status),
			code:    CodeCourseNotApproved,
		},
	}
}
