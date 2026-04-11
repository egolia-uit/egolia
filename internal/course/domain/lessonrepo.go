package domain

import (
	"context"

	"github.com/google/uuid"
)

type LessonRepo interface {
	Get(ctx context.Context, params *LessonRepoGet) (*Lesson, error)
	// Get(ctx context.Context, params *LessonGetParams) (*Lesson, error)
	// GetMany(ctx context.Context, params *LessonGetManyParams) ([]*Lesson, error)
	GetByPrevious(ctx context.Context, params *LessonRepoGetByPrevious) (*Lesson, error)
	GetNextByID(ctx context.Context, params *LessonRepoGetNextByID) (*Lesson, error)
	Save(ctx context.Context, lesson *Lesson) error
}

type LessonRepoGet struct {
	ID        uuid.UUID
	ForUpdate bool
}

type LessonRepoGetByPrevious struct {
	Previous  *Lesson
	ForUpdate bool
}

type LessonRepoGetNextByID struct {
	ID        uuid.UUID
	ForUpdate bool
}

//	type LessonGetManyParams struct {
//		SectionID uuid.UUID
//		ForUpdate bool
//	}
