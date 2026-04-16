package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type GetLessonDetail struct {
	LessonID uuid.UUID
}

type GetLessonDetailReadModel interface {
	GetVideoLessonDetail(ctx context.Context, params *GetLessonDetail) (*VideoLesson, error)
	GetTestLessonDetail(ctx context.Context, params *GetLessonDetail) (*TestLesson, error)
}

type GetLessonDetailHandler struct {
	readModel GetLessonDetailReadModel
}

func NewGetLessonDetailHandler(readModel GetLessonDetailReadModel) *GetLessonDetailHandler {
	return &GetLessonDetailHandler{
		readModel: readModel,
	}
}

func (h *GetLessonDetailHandler) Handle(ctx context.Context, params *GetLessonDetail) (Lesson, error) {
	videoLesson, err := h.readModel.GetVideoLessonDetail(ctx, params)
	if err == nil {
		return videoLesson, nil
	}
	var lessonNotFound *errs.LessonNotFound
	if !errors.As(err, &lessonNotFound) {
		return nil, err
	}
	testLesson, err := h.readModel.GetTestLessonDetail(ctx, params)
	return testLesson, err
}
