package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestEnrollInCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	actorID := "learner-1"

	t.Run("valid", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().Enrollment().Return(mockEnrollment)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockEnrollment.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(false, nil)
		mockEnrollment.EXPECT().Save(ctx, mock.MatchedBy(func(e *domain.Enrollment) bool {
			return e.LearnerID() == actorID && e.CourseID() == courseID
		})).Return(nil)

		svc := domain.NewEnrollInCourseSvc()
		handler := app.NewEnrollInCourseHandler(svc, uow)
		err = handler.Handle(ctx, &app.EnrollInCourse{
			CourseID: courseID,
			ActorID:  actorID,
		})
		require.NoError(t, err)
	})

	t.Run("already enrolled", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().Enrollment().Return(mockEnrollment)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
		mockEnrollment.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(true, nil)

		svc := domain.NewEnrollInCourseSvc()
		handler := app.NewEnrollInCourseHandler(svc, uow)
		err = handler.Handle(ctx, &app.EnrollInCourse{
			CourseID: courseID,
			ActorID:  actorID,
		})
		require.Error(t, err)
	})
}
