package readmodel

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/app"
	"gorm.io/gorm"
)

type CourseProgressReadRepo struct {
	db *gorm.DB
}

func NewCourseProgressReadRepo(db *gorm.DB) *CourseProgressReadRepo {
	return &CourseProgressReadRepo{db: db}
}

var _ app.GetCourseProgressReadModel = (*CourseProgressReadRepo)(nil)

func (r *CourseProgressReadRepo) GetCourseProgress(ctx context.Context, params *app.GetCourseProgress) (*app.CourseProgress, error) {
	// TODO: Implement logic to calculate course progress
	return nil, nil
}
