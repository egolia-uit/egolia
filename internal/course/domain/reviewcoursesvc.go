package domain

import (
	"context"
)

type ReviewCourse struct {
	Course  *Course
	ActorID string
	Comment string
	Rating  int
}

type ReviewCourseSvc struct {
	enrollRepo EnrollmentRepo
	reviewRepo ReviewRepo
}

func NewReviewCourseSvc(enrollRepo EnrollmentRepo, reviewRepo ReviewRepo) *ReviewCourseSvc {
	return &ReviewCourseSvc{
		enrollRepo: enrollRepo,
		reviewRepo: reviewRepo,
	}
}

func (s *ReviewCourseSvc) Handle(ctx context.Context, review *ReviewCourse) (*Review, error) {
	// hasEnrolled, err := s.enrollRepo.ExistsByCourseAndLearner(ctx, review.Course.ID(), review.ActorID)
	// if err != nil {
	// 	return nil, err
	// }
	// if !hasEnrolled {
	// 	return nil, errs.NewInvalid("learner has not enrolled in this course")
	// }

	// hasReviewed, err := s.reviewRepo.ExistsByCourseAndLearner(ctx, review.Course.ID(), review.ActorID)
	// if err != nil {
	// 	return nil, err
	// }
	// if hasReviewed {
	// 	return nil, errs.NewInvalid("learner has already reviewed this course")
	// }

	// if review.Course.Status() != CourseStatusApproved && review.Course.Hidden() {
	// 	return nil, errs.NewInvalid("course is not published")
	// }

	// reviewID := uuid.New()
	// r := NewReview(reviewID, review.Course.ID(), review.ActorID, review.Rating, review.Comment)

	// return r, nil
	panic("not implemented")
}
