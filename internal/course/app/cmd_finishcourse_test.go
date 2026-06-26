package app_test

import (
	"testing"
	"time"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestFinishCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	actorID := "learner-1"

	t.Run("valid", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		reg.EXPECT().Enrollment().Return(mockEnrollment)

		enrollment := domain.NewEnrollment(uuid.New(), actorID, courseID, time.Now())

		mockEnrollment.EXPECT().GetByCourseAndLearner(ctx,
			domain.EnrollmentRepoGetByCourseAndLearner{CourseID: courseID, LearnerID: actorID},
			true,
		).Return(enrollment, nil)
		mockEnrollment.EXPECT().Save(ctx, mock.MatchedBy(func(e *domain.Enrollment) bool {
			return e.CompletedAt() != nil
		})).Return(nil)

		svc := &domain.FinishCourseSvc{}
		handler := app.NewFinishCourseHandler(svc, uow)
		err := handler.Handle(ctx, &app.FinishCourse{
			CourseID: courseID,
			ActorID:  actorID,
		})
		require.NoError(t, err)
	})

	t.Run("enrollment not found", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		reg.EXPECT().Enrollment().Return(mockEnrollment)

		mockEnrollment.EXPECT().GetByCourseAndLearner(ctx,
			domain.EnrollmentRepoGetByCourseAndLearner{CourseID: courseID, LearnerID: actorID},
			true,
		).Return(nil, gorm.ErrRecordNotFound)

		svc := &domain.FinishCourseSvc{}
		handler := app.NewFinishCourseHandler(svc, uow)
		err := handler.Handle(ctx, &app.FinishCourse{
			CourseID: courseID,
			ActorID:  actorID,
		})
		require.Error(t, err)
	})
}
