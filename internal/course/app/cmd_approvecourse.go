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
	uow              domain.UnitOfWork
	approveCourseSvc *domain.ApproveCourseSvc
}

func NewApproveCourseHandler(uow domain.UnitOfWork, approveCourseSvc *domain.ApproveCourseSvc, logger *slog.Logger, tracer Tracer) ApproveCourseCmd {
	handler := &ApproveCourseHandler{
		uow:              uow,
		approveCourseSvc: approveCourseSvc,
	}
	return NewCmdSpan(NewCmdLog(handler, logger), tracer)
}

var _ Cmd[ApproveCourse] = (*ApproveCourseHandler)(nil)

func (h *ApproveCourseHandler) Handle(ctx context.Context, cmd *ApproveCourse) error {
	var changedLessonIDs []uuid.UUID
	var publishedCourseID uuid.UUID

	err := h.uow.Execute(ctx, func(repoRegistry domain.RepoRegistry) error {
		course, err := repoRegistry.Course().GetFull(ctx, cmd.CourseID)
		if err != nil {
			return err
		}

		if course.OriginalCourseID() == nil {
			if err := h.approveCourseSvc.Handle(ctx, course); err != nil {
				return err
			}
			if err := repoRegistry.Course().Save(ctx, course); err != nil {
				return err
			}
		} else {
			publishedCourseID = *course.OriginalCourseID()
			originalCourse, err := repoRegistry.Course().GetFull(ctx, publishedCourseID)
			if err != nil {
				return err
			}

			// Validate bản nháp trước khi merge để đảm bảo không vi phạm rules
			if err := h.approveCourseSvc.Handle(ctx, course); err != nil {
				return err
			}

			changedLessonIDs, err = originalCourse.Merge(course)
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
	if err != nil {
		return err
	}

	// Cập nhật lại isCompleted cho các bài học đã bị thay đổi trong goroutine
	if len(changedLessonIDs) > 0 && publishedCourseID != uuid.Nil {
		go func(courseID uuid.UUID, lessonIDs []uuid.UUID) {
			bgCtx := context.Background() // Dùng Background context để tránh bị hủy khi request kết thúc
			_ = h.uow.Execute(bgCtx, func(repoRegistry domain.RepoRegistry) error {
				enrollments, err := repoRegistry.Enrollment().GetByCourseID(bgCtx, courseID)
				if err != nil {
					return err
				}

				for _, enrollment := range enrollments {
					if enrollment == nil {
						continue
					}
					for _, lessonID := range lessonIDs {
						progress, err := repoRegistry.LessonProgress().GetByUserIDAndLesson(bgCtx, enrollment.LearnerID(), lessonID)
						if err == nil && progress != nil && progress.IsCompleted() {
							progress.ResetProgress()
							_ = repoRegistry.LessonProgress().Save(bgCtx, progress)
						}
					}
				}
				return nil
			})
		}(publishedCourseID, changedLessonIDs)
	}

	return nil
}
