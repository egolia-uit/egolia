package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"

	commonhandler "github.com/egolia-uit/egolia/pkg/common/handler"
)

type GetLessonDetail struct {
	LessonID uuid.UUID
}

type GetLessonDetailHandler struct {
	readModel GetLessonDetailReadModel
}

func NewGetLessonDetailHandler(readModel GetLessonDetailReadModel) *GetLessonDetailHandler {
	return &GetLessonDetailHandler{
		readModel: readModel,
	}
}

var _ commonhandler.Query[GetLessonDetail, Lesson] = (*GetLessonDetailHandler)(nil)

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
