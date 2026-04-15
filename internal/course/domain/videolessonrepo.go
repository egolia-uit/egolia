package domain

import (
	"context"

	"github.com/google/uuid"
)

type VideoLessonRepo interface {
	Get(ctx context.Context, params *VideoLessonRepoGet, forUpdate bool) (*VideoLesson, error)
	GetByPrevious(ctx context.Context, params *VideoLessonRepoGetByPrevious, forUpdate bool) (*Lesson, error)
	GetNextByID(ctx context.Context, params *VideoLessonRepoGetNextByID, forUpdate bool) (*Lesson, error)
	Save(ctx context.Context, lesson *VideoLesson) error
}

type VideoLessonRepoGet struct {
	ID uuid.UUID
}

type VideoLessonRepoGetByPrevious struct {
	Previous *VideoLesson
}

type VideoLessonRepoGetNextByID struct {
	ID uuid.UUID
}
