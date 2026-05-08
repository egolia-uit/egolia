package domain

import (
	"context"
)

type LessonProgressRepo interface {
	Save(ctx context.Context, progress LessonProgress) error
}
