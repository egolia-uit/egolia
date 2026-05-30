package domain_test

import (
	"context"
	"testing"

	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

var ctx = context.Background()

func TestAuthorizationSvc_HasGetCourseDetailPermission(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		userID     string
		userRoles  []string
		setupMocks func(*domain.MockCourseRepo, *domain.MockEnrollmentRepo, *domain.Course)
		want       bool
		wantErr    bool
	}{
		{
			name:      "admin user",
			userID:    "admin-1",
			userRoles: []string{"admin"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				// no repo calls expected
			},
			want:    true,
			wantErr: false,
		},
		{
			name:      "instructor of course",
			userID:    "instructor-1",
			userRoles: []string{"instructor"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
			},
			want:    true,
			wantErr: false,
		},
		{
			name:      "enrolled learner on approved course",
			userID:    "learner-1",
			userRoles: []string{"learner"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				c.Approve()
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
				me.On("ExistsByCourseAndLearner", mock.Anything, c.ID(), "learner-1").Return(true, nil)
			},
			want:    true,
			wantErr: false,
		},
		{
			name:      "unenrolled learner on approved course",
			userID:    "learner-1",
			userRoles: []string{"learner"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				c.Approve()
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
				me.On("ExistsByCourseAndLearner", mock.Anything, c.ID(), "learner-1").Return(false, nil)
			},
			want:    false,
			wantErr: false,
		},
		{
			name:      "unenrolled learner on hidden course",
			userID:    "learner-1",
			userRoles: []string{"learner"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				c.Approve()
				c.ToggleHidden()
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
			},
			want:    false,
			wantErr: false,
		},
		{
			name:      "repo error",
			userID:    "learner-1",
			userRoles: []string{"learner"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(nil, assert.AnError)
			},
			want:    false,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			mockCourse := domain.NewMockCourseRepo(t)
			mockEnroll := domain.NewMockEnrollmentRepo(t)
			course, err := domain.NewCourse(uuid.New(), "Test", "instructor-1", 1000, "desc", "video")
			require.NoError(t, err)
			tt.setupMocks(mockCourse, mockEnroll, course)

			svc := domain.NewAuthorizationSvc(mockCourse, mockEnroll)
			got, err := svc.HasGetCourseDetailPermission(ctx, course.ID(), tt.userID, tt.userRoles)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.want, got)
			}
		})
	}
}

func TestAuthorizationSvc_HasHideCoursePermission(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		userID     string
		userRoles  []string
		setupMocks func(*domain.MockCourseRepo, *domain.MockEnrollmentRepo, *domain.Course)
		want       bool
		wantErr    bool
	}{
		{
			name:      "admin user",
			userID:    "admin-1",
			userRoles: []string{"admin"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				// no repo calls expected
			},
			want:    true,
			wantErr: false,
		},
		{
			name:      "instructor of course",
			userID:    "instructor-1",
			userRoles: []string{"instructor"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
			},
			want:    true,
			wantErr: false,
		},
		{
			name:      "other instructor",
			userID:    "instructor-2",
			userRoles: []string{"instructor"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
			},
			want:    false,
			wantErr: false,
		},
		{
			name:      "regular learner",
			userID:    "learner-1",
			userRoles: []string{"learner"},
			setupMocks: func(mc *domain.MockCourseRepo, me *domain.MockEnrollmentRepo, c *domain.Course) {
				mc.On("Get", mock.Anything, domain.CourseRepoGet{ID: c.ID()}, false).Return(c, nil)
			},
			want:    false,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			mockCourse := domain.NewMockCourseRepo(t)
			mockEnroll := domain.NewMockEnrollmentRepo(t)
			course, err := domain.NewCourse(uuid.New(), "Test", "instructor-1", 1000, "desc", "video")
			require.NoError(t, err)
			tt.setupMocks(mockCourse, mockEnroll, course)

			svc := domain.NewAuthorizationSvc(mockCourse, mockEnroll)
			got, err := svc.HasHideCoursePermission(ctx, course.ID(), tt.userID, tt.userRoles)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.want, got)
			}
		})
	}
}
