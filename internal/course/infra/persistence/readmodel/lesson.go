package readmodel

import (
	"context"
	"errors"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/model"
	"gorm.io/gorm"
)

type LessonReadRepo struct {
	db               *gorm.DB
	objectStorageSvc app.ObjectStorageSvc
}

func NewLessonReadRepo(db *gorm.DB, objectStorageSvc app.ObjectStorageSvc) *LessonReadRepo {
	return &LessonReadRepo{db: db, objectStorageSvc: objectStorageSvc}
}

var _ app.GetLessonDetailReadModel = (*LessonReadRepo)(nil)

func (r *LessonReadRepo) GetVideoLessonDetail(ctx context.Context, params *app.GetLessonDetail) (*app.VideoLesson, error) {
	var m model.Lesson
	err := r.db.WithContext(ctx).
		Preload("VideoLesson").
		Where("id = ? AND lesson_type = ?", params.LessonID, domain.LessonTypeVideo).
		First(&m).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewLessonNotFound(params.LessonID, err)
	}
	if err != nil {
		return nil, err
	}
	if m.VideoLesson == nil {
		return nil, errs.NewLessonNotFound(params.LessonID, nil)
	}

	videoURL := ""
	if key := m.VideoLesson.VideoKey; key != "" {
		videoURL, err = r.objectStorageSvc.VideoKeyToURL(ctx, key)
		if err != nil {
			return nil, err
		}
	}
	return &app.VideoLesson{
		LessonBase: app.LessonBase{
			ID:         m.ID,
			Title:      m.Title,
			LessonType: app.LessonTypeVideo,
		},
		VideoURL: videoURL,
		Duration: time.Duration(m.VideoLesson.Duration) * time.Second,
	}, nil
}

func (r *LessonReadRepo) GetTestLessonDetail(ctx context.Context, params *app.GetLessonDetail) (*app.TestLesson, error) {
	var m model.Lesson
	err := r.db.WithContext(ctx).
		Preload("TestLesson.Questions.Answers").
		Where("id = ? AND lesson_type = ?", params.LessonID, domain.LessonTypeTest).
		First(&m).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewLessonNotFound(params.LessonID, err)
	}
	if err != nil {
		return nil, err
	}
	if m.TestLesson == nil {
		return nil, errs.NewLessonNotFound(params.LessonID, nil)
	}

	questions := make([]app.TestQuestion, 0, len(m.TestLesson.Questions))
	for _, q := range m.TestLesson.Questions {
		answers := make([]app.TestAnswer, 0, len(q.Answers))
		for _, a := range q.Answers {
			answers = append(answers, app.TestAnswer{
				ID:        a.ID,
				Content:   a.Answer,
				IsCorrect: a.IsCorrect,
			})
		}
		questions = append(questions, app.TestQuestion{
			ID:       q.ID,
			Question: q.Question,
			Answers:  answers,
		})
	}

	return &app.TestLesson{
		LessonBase: app.LessonBase{
			ID:         m.ID,
			Title:      m.Title,
			LessonType: app.LessonTypeTest,
		},
		QuestionType: app.QuestionType(m.TestLesson.QuestionType),
		Questions:    questions,
	}, nil
}
