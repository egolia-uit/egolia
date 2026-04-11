package domain

import (
	"context"

	"github.com/google/uuid"
)

type TestLessonRepo interface {
	Get(ctx context.Context, params *TestLessonRepoGet) (*TestLesson, error)
	Save(ctx context.Context, lesson *TestLesson) error
}

type TestLessonRepoGet struct {
	ID        uuid.UUID
	ForUpdate bool
}
