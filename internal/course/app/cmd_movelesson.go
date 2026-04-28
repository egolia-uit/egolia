package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
)

type MoveLessonAfterLesson struct {
	ID   uuid.UUID
	Type LessonType
}

type MoveLesson struct {
	LessonID    uuid.UUID
	LessonType  LessonType
	AfterLesson *MoveLessonAfterLesson
	SectionID   uuid.UUID
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
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			SectionID: params.SectionID,
		}, true)
		if err != nil {
			return err
		}

		var prevLesson domain.Lesson
		var moveErr error

		if params.AfterLesson != nil {
			prevLesson = course.GetLesson(params.AfterLesson.ID)
			if prevLesson == nil {
				return errs.NewLessonNotFound(params.AfterLesson.ID, nil)
			}
		}

		var nextLesson domain.Lesson
		section := course.GetSection(params.SectionID)
		if section == nil {
			return errs.NewLessonNotFound(params.SectionID, nil)
		}
		if prevLesson != nil {
			for i, lesson := range section.Lessons() {
				if lesson == nil {
					continue
				}
				if lesson.ID() == prevLesson.ID() && i+1 < len(section.Lessons()) {
					nextLesson = section.Lessons()[i+1]
					break
				}
			}
		}

		var targetLesson domain.Lesson
		targetLesson = course.GetLesson(params.LessonID)
		if targetLesson == nil {
			return errs.NewLessonNotFound(params.LessonID, nil)
		}

		if moveErr = h.moveLessonSvc.Handle(&domain.MoveLesson{
			PrevLesson: prevLesson,
			NextLesson: nextLesson,
			Target:     targetLesson,
			SectionID:  params.SectionID,
		}); moveErr != nil {
			return moveErr
		}

		if err = repoRegistry.Course().Save(ctx, course); err != nil {
			return err
		}
		return nil
	})
}
