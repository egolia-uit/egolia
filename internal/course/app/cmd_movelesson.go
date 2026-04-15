package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type MoveLessonAfterLesson struct {
	ID   uuid.UUID
	Type LessonType
}

type MoveLesson struct {
	LessonID   uuid.UUID
	LessonType LessonType

	Afterlesson *MoveLessonAfterLesson

	SectionID uuid.UUID
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
// TODO: Duc lam tiep nha hehe
func (h *MoveLessonHandler) Handle(ctx context.Context, params *MoveLesson) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		var prevLesson domain.Lesson
		var err error

		if params.Afterlesson != nil {
			switch params.Afterlesson.Type {
			case LessonTypeVideo:
				prevLesson, err = repoRegistry.VideoLesson().Get(ctx, &domain.VideoLessonRepoGet{
					ID: params.Afterlesson.ID,
				}, false)
				if err != nil {
					return err // TODO: map to errs
				}
			case LessonTypeTest:
				prevLesson, err = repoRegistry.TestLesson().Get(ctx, &domain.TestLessonRepoGet{
					ID: params.Afterlesson.ID,
				}, false)
				if err != nil {
					return err // TODO: map to errs
				}
			}
		}

		// TODO: Check if prev lesson is not nil, then get the next lesson
		// Asume this is the next lesson id
		nextLesson := &domain.VideoLesson{}

		// TODO: not always we have the next lesson after prev lesson
		// if err != nil && !errors.As(err, &errs.LessonNotFound{}) {
		// 	return err
		// }

		var targetLesson domain.Lesson

		switch params.LessonType {
		case LessonTypeVideo:
			targetLesson, err = repoRegistry.VideoLesson().Get(ctx, &domain.VideoLessonRepoGet{
				ID: params.LessonID,
			}, true)
			if err != nil {
				return err // TODO: map to errs
			}
		case LessonTypeTest:
			targetLesson, err = repoRegistry.TestLesson().Get(ctx, &domain.TestLessonRepoGet{
				ID: params.LessonID,
			}, true)
			if err != nil {
				return err // TODO: map to errs
			}
		}

		if err = h.moveLessonSvc.Handle(&domain.MoveLesson{
			PrevLesson: prevLesson,
			NextLesson: nextLesson,
			Target:     targetLesson,
			SectionID:  params.SectionID,
		}); err != nil {
			return err
		}

		switch lesson := targetLesson.(type) {
		case *domain.VideoLesson:
			err = repoRegistry.VideoLesson().Save(ctx, lesson)
			if err != nil {
				return err // TODO: map to errs
			}
		case *domain.TestLesson:
			err = repoRegistry.TestLesson().Save(ctx, lesson)
			if err != nil {
				return err // TODO: map to errs
			}
		}
		return nil
	})
}
