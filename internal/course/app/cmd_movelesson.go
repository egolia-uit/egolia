package app

import (
	"context"
	"errors"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type MoveLesson struct {
	LessonID      uuid.UUID
	AfterLessonID uuid.UUID
}

type MoveLessonHandler struct {
	moveLessonSvc *domain.MoveLessonSvc
	uow           domain.UnitOfWork
}

func NewMoveLessonHandler(
	moveLessonSvc *domain.MoveLessonSvc,
	uow domain.UnitOfWork,
) *MoveLessonHandler {
	return &MoveLessonHandler{
		moveLessonSvc: moveLessonSvc,
		uow:           uow,
	}
}

// TODO: uow
// TODO: Get course to check if user id == course instructor id
func (h *MoveLessonHandler) Handle(ctx context.Context, params *MoveLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		lessonRepo := repoRegistry.Lesson()
		lesson, err := lessonRepo.Get(ctx, &domain.LessonRepoGet{
			ID:        params.LessonID,
			ForUpdate: true,
		})
		if err != nil {
			return err
		}
		afterLesson, err := lessonRepo.GetByPrevious(ctx, &domain.LessonRepoGetByPrevious{
			Previous:  lesson,
			ForUpdate: true,
		})
		if err != nil {
			return err
		}
		nextLesson, err := lessonRepo.GetNextByID(ctx, &domain.LessonRepoGetNextByID{
			ID:        params.AfterLessonID,
			ForUpdate: true,
		})
		if err != nil && !errors.As(err, &errs.LessonNotFound{}) {
			return err
		}
		h.moveLessonSvc.Handle(&domain.MoveLesson{
			PreviousLesson: afterLesson,
			NextLesson:     nextLesson,
			Target:         lesson,
		})
		return lessonRepo.Save(ctx, lesson)
	})
}
