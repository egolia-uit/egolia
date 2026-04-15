package domain

import (
	"context"

	"github.com/google/uuid"
)

type TestLessonRepo interface {
	Get(ctx context.Context, params *TestLessonRepoGet, forUpdate bool) (*TestLesson, error)
	GetByPrevious(ctx context.Context, params *TestLessonRepoGetByPrevious, forUpdate bool) (*TestLesson, error)
	GetNextByID(ctx context.Context, params *TestLessonRepoGetNextByID, forUpdate bool) (*TestLesson, error)
	Save(ctx context.Context, lesson *TestLesson) error
}

type TestLessonRepoGet struct {
	ID uuid.UUID
}

type TestLessonRepoGetByPrevious struct {
	Previous *TestLesson
}

type TestLessonRepoGetNextByID struct {
	ID uuid.UUID
}
