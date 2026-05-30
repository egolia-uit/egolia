package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestReviewCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	actorID := "learner-1"

	t.Run("valid -> ReviewRepo.Save called", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		mockReview := domain.NewMockReviewRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().Enrollment().Return(mockEnrollment)
		reg.EXPECT().Review().Return(mockReview)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().Get(ctx, domain.CourseRepoGet{ID: courseID}, true).Return(course, nil)
		mockEnrollment.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(true, nil)
		mockReview.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(false, nil)
		mockReview.EXPECT().Save(ctx, mock.MatchedBy(func(r *domain.Review) bool {
			return r.CourseID() == courseID && r.UserID() == actorID && r.Rating() == 4
		})).Return(nil)

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewReviewCourseHandler(reviewSvc, uow)
		err = handler.Handle(ctx, &app.ReviewCourse{
			CourseID: courseID,
			ActorID:  actorID,
			Comment:  "Great course!",
			Rating:   4,
		})
		require.NoError(t, err)
	})

	t.Run("already reviewed -> error", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		mockReview := domain.NewMockReviewRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().Enrollment().Return(mockEnrollment)
		reg.EXPECT().Review().Return(mockReview)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().Get(ctx, domain.CourseRepoGet{ID: courseID}, true).Return(course, nil)
		mockEnrollment.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(true, nil)
		mockReview.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(true, nil)

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewReviewCourseHandler(reviewSvc, uow)
		err = handler.Handle(ctx, &app.ReviewCourse{
			CourseID: courseID,
			ActorID:  actorID,
			Comment:  "Great course!",
			Rating:   5,
		})
		require.Error(t, err)
	})

	t.Run("not enrolled -> error", func(t *testing.T) {
		t.Parallel()

		uow, reg := withUow(t)
		mockCourse := domain.NewMockCourseRepo(t)
		mockEnrollment := domain.NewMockEnrollmentRepo(t)
		reg.EXPECT().Course().Return(mockCourse)
		reg.EXPECT().Enrollment().Return(mockEnrollment)

		course, err := domain.NewCourse(courseID, "Test Course", "instructor-1", 0, "overview", "")
		require.NoError(t, err)

		mockCourse.EXPECT().Get(ctx, domain.CourseRepoGet{ID: courseID}, true).Return(course, nil)
		mockEnrollment.EXPECT().ExistsByCourseAndLearner(ctx, courseID, actorID).Return(false, nil)

		reviewSvc := &domain.ReviewPolicySvc{}
		handler := app.NewReviewCourseHandler(reviewSvc, uow)
		err = handler.Handle(ctx, &app.ReviewCourse{
			CourseID: courseID,
			ActorID:  actorID,
			Comment:  "Great course!",
			Rating:   5,
		})
		require.Error(t, err)
	})
}
