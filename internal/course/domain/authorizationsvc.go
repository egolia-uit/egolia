package domain

import (
	"context"

	"github.com/google/uuid"
)

type AuthorizationSvc struct {
	courseRepo     CourseRepo
	enrollmentRepo EnrollmentRepo
}

func hasRole(userRoles []string, target string) bool {
	for _, role := range userRoles {
		if role == target {
			return true
		}
	}
	return false
}

func NewAuthorizationSvc(courseRepo CourseRepo, enrollmentRepo EnrollmentRepo) *AuthorizationSvc {
	return &AuthorizationSvc{
		courseRepo:     courseRepo,
		enrollmentRepo: enrollmentRepo,
	}
}

func (s *AuthorizationSvc) HasGetCourseDetailPermission(ctx context.Context, courseID uuid.UUID, userID string, userRoles []string) (bool, error) {
	if hasRole(userRoles, "admin") {
		return true, nil
	}

	course, err := s.courseRepo.Get(ctx, CourseRepoGet{ID: courseID}, false)
	if err != nil {
		return false, err
	}

	if hasRole(userRoles, "instructor") && course.InstructorID() == userID {
		return true, nil
	}

	if !course.IsPublic() {
		return false, nil
	}

	hasEnrolled, err := s.enrollmentRepo.ExistsByCourseAndLearner(ctx, courseID, userID)
	if err != nil {
		return false, err
	}
	if hasEnrolled {
		return true, nil
	}
	return false, nil
}
