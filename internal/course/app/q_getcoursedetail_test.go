package app_test

import (
	"errors"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetCourseDetailHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	userID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T) (*app.MockGetCourseDetailReadModel, *domain.AuthorizationSvc)
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "has permission -> returns detail",
			setup: func(t *testing.T) (*app.MockGetCourseDetailReadModel, *domain.AuthorizationSvc) {
				t.Helper()
				mockRead := app.NewMockGetCourseDetailReadModel(t)
				deleted := false
				mockRead.EXPECT().GetCourseDetail(ctx, courseID, &deleted).Return(&app.CourseDetail{
					Course: app.Course{
						ID:                   uuid.UUID{},
						OriginalCourseID:     uuid.UUID{},
						Hidden:               false,
						Title:                "",
						InstructorID:         "",
						Status:               app.CourseStatus(""),
						Price:                0,
						Overview:             "",
						IntroductionVideoKey: nil,
						IntroductionVideoURL: nil,
					},
					Sections: nil,
				}, nil)
				// Mock courseRepo.Get for auth check: return a public course
				mockCourse := domain.NewMockCourseRepo(t)
				mockCourse.EXPECT().Get(ctx, domain.CourseRepoGet{ID: courseID}, false).Return(
					domain.UnmarshalCourse(courseID, nil, "Test Course", userID, domain.CourseStatusApproved, 0, "", false, "", nil, nil), nil,
				)
				// Mock enrollment: user is enrolled, so permission is granted
				mockEnrollment := domain.NewMockEnrollmentRepo(t)
				mockEnrollment.EXPECT().ExistsByCourseAndLearner(ctx, courseID, userID).Return(true, nil)
				authSvc := domain.NewAuthorizationSvc(mockCourse, mockEnrollment)
				return mockRead, authSvc
			},
			wantErr: require.NoError,
		},
		{
			name: "no permission -> unauthorized error",
			setup: func(t *testing.T) (*app.MockGetCourseDetailReadModel, *domain.AuthorizationSvc) {
				t.Helper()
				mockRead := app.NewMockGetCourseDetailReadModel(t)
				// Mock courseRepo.Get for auth check: return a non-public (draft) course
				mockCourse := domain.NewMockCourseRepo(t)
				mockCourse.EXPECT().Get(ctx, domain.CourseRepoGet{ID: courseID}, false).Return(
					domain.UnmarshalCourse(courseID, nil, "Test Course", "other-instructor", domain.CourseStatusDraft, 0, "", false, "", nil, nil), nil,
				)
				authSvc := domain.NewAuthorizationSvc(mockCourse, domain.NewMockEnrollmentRepo(t))
				return mockRead, authSvc
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.ErrorIs(tt, err, errs.Unauthorized)
			},
		},
		{
			name: "authsvc error -> propagated",
			setup: func(t *testing.T) (*app.MockGetCourseDetailReadModel, *domain.AuthorizationSvc) {
				t.Helper()
				mockRead := app.NewMockGetCourseDetailReadModel(t)
				mockCourse := domain.NewMockCourseRepo(t)
				mockCourse.EXPECT().Get(ctx, mock.Anything, false).Return(nil, errors.New("db error"))
				authSvc := domain.NewAuthorizationSvc(mockCourse, domain.NewMockEnrollmentRepo(t))
				return mockRead, authSvc
			},
			wantErr: require.Error,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			mockRead, authSvc := tc.setup(t)
			handler := app.NewGetCourseDetailHandler(mockRead, authSvc)
			result, err := handler.Handle(ctx, &app.GetCourseDetail{
				CourseID:  courseID,
				UserID:    userID,
				UserRoles: []app.UserRole{},
			})
			tc.wantErr(t, err)
			if err == nil {
				require.NotNil(t, result)
			}
		})
	}
}
