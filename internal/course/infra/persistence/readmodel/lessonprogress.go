package readmodel

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/app"
	"gorm.io/gorm"
)

type LessonProgressReadRepo struct {
	db *gorm.DB
}

func NewLessonProgressReadRepo(db *gorm.DB) *LessonProgressReadRepo {
	return &LessonProgressReadRepo{db: db}
}

var _ app.GetLessonProgressReadModel = (*LessonProgressReadRepo)(nil)

func (r *LessonProgressReadRepo) GetLessonProgress(ctx context.Context, params *app.GetLessonProgress) (app.LessonProgress, error) {
	// var m model.LessonProgress
	// err := r.db.WithContext(ctx).
	// 	Where("user_id = ? AND lesson_id = ?", params.UserID, params.LessonID).
	// 	First(&m).Error

	// if errors.Is(err, gorm.ErrRecordNotFound) {
	// 	return nil, nil
	// }
	// if err != nil {
	// 	return nil, err
	// }

	// switch domain.LessonType(m.LessonType) {
	// case domain.LessonTypeVideo:
	// 	var lastViewedAt time.Time
	// 	if m.LastViewedAt != nil {
	// 		lastViewedAt = *m.LastViewedAt
	// 	}
	// 	return &app.VideoLessonProgress{
	// 		LessonProgressBase: app.LessonProgressBase{
	// 			ID:          m.ID,
	// 			UserID:      m.UserID,
	// 			LessonID:    m.LessonID,
	// 			IsCompleted: m.IsCompleted,
	// 		},
	// 		WatchedSeconds: m.WatchedSeconds,
	// 		LastViewedAt:   lastViewedAt,
	// 	}, nil
	// case domain.LessonTypeTest:
	// 	return &app.LessonProgressTest{
	// 		LessonProgressBase: app.LessonProgressBase{
	// 			ID:          m.ID,
	// 			UserID:      m.UserID,
	// 			LessonID:    m.LessonID,
	// 			IsCompleted: m.IsCompleted,
	// 		},
	// 	}, nil
	// }
	// return nil, nil
	return nil, errors.New("not implemented")
}
