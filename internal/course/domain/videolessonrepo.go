package domain

import (
	"context"

	"github.com/google/uuid"
)

type VideoLessonRepo interface {
	Get(ctx context.Context, params *VideoLessonRepoGet) (*VideoLesson, error)
	Save(ctx context.Context, lesson *VideoLesson) error
}

type VideoLessonRepoGet struct {
	ID        uuid.UUID
	ForUpdate bool
}
