package app

import (
	"context"
	"log/slog"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type ApproveCourse struct {
	CourseID uuid.UUID
}

type ApproveCourseCmd Cmd[ApproveCourse]

type ApproveCourseHandler struct {
	uow domain.UnitOfWork
}

func NewApproveCourseHandler(uow domain.UnitOfWork, logger *slog.Logger, tracer Tracer) ApproveCourseCmd {
	handler := &ApproveCourseHandler{
		uow: uow,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[ApproveCourse] = (*ApproveCourseHandler)(nil)

func (h *ApproveCourseHandler) Handle(ctx context.Context, cmd *ApproveCourse) error {
	return h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
			ID: cmd.CourseID,
		}, true)
		if err != nil {
			return err
		}

		if course.OriginalCourseID() == nil {
			course.SetStatus(domain.CourseStatusApproved)
			if err := repoRegistry.Course().Save(ctx, course); err != nil {
				return err
			}
		} else {
			originalCourseID := *course.OriginalCourseID()
			originalCourse, err := repoRegistry.Course().Get(ctx, domain.CourseRepoGet{
				ID: originalCourseID,
			}, true)
			if err != nil {
				return err
			}

			_, err = originalCourse.Merge(course)
			if err != nil {
				return err
			}

			course.Delete()

			if err := repoRegistry.Course().Save(ctx, originalCourse); err != nil {
				return err
			}
			if err := repoRegistry.Course().Save(ctx, course); err != nil {
				return err
			}
		}

		return nil
	})
}

// listLessonsChanged, err := originalCourse.Merge(course)
// if err != nil {
// 	return err
// }
// // go routine to update enrollment if list lessons changed
// if listLessonsChanged != nil {
// 	go func() {
// 		if err := repoRegistry.Enrollment().UpdateEnrollmentListLessons(ctx, course.ID()); err != nil {
// 			// log error
// 		}
// 	}()
// }
