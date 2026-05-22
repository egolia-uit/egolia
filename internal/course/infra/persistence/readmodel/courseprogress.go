package readmodel

import (
	"context"
	"errors"

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

type courseProgressRow struct {
	Progress         float64
	CompletedLessons int32
	TotalLessons     int32
}

func (r *CourseProgressReadRepo) GetCourseProgress(ctx context.Context, params *app.GetCourseProgress) (*app.CourseProgress, error) {
	var row courseProgressRow
	err := r.db.WithContext(ctx).Raw(`
		SELECT
			COALESCE(cp.progress, 0) AS progress,
			COUNT(lp.id) FILTER (WHERE lp.is_completed = true AND lp.deleted_at IS NULL) AS completed_lessons,
			COUNT(l.id) AS total_lessons
		FROM sections s
		JOIN lessons l ON l.section_id = s.id AND l.deleted_at IS NULL
		LEFT JOIN lesson_progresses lp ON lp.lesson_id = l.id AND lp.user_id = ? AND lp.deleted_at IS NULL
		LEFT JOIN course_progresses cp ON cp.course_id = s.course_id AND cp.user_id = ?
		WHERE s.course_id = ? AND s.deleted_at IS NULL
	`, params.UserID, params.UserID, params.CourseID).Scan(&row).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &app.CourseProgress{
		CourseID:         params.CourseID,
		ProgressPercent:  float32(row.Progress),
		CompletedLessons: row.CompletedLessons,
		TotalLessons:     row.TotalLessons,
		IsCompleted:      row.TotalLessons > 0 && row.CompletedLessons >= row.TotalLessons,
	}, nil
}
