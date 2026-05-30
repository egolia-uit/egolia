package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestDeleteCourseHandler_Handle(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	actorID := "inst-1"

	validCmd := &app.DeleteCourse{
		CourseID: courseID,
		ActorID:  actorID,
	}

	tests := []struct {
		name       string
		cmd        *app.DeleteCourse
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "no enrollments deletes course and saves",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusDraft, 1000, "overview", false, "video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				enrollmentRepo := domain.NewMockEnrollmentRepo(t)
				reg.On("Course").Return(courseRepo)
				reg.On("Enrollment").Return(enrollmentRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
				enrollmentRepo.On("ExistsByCourseID", mock.Anything, courseID).Return(false, nil)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "has enrollments returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusDraft, 1000, "overview", false, "video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				enrollmentRepo := domain.NewMockEnrollmentRepo(t)
				reg.On("Course").Return(courseRepo)
				reg.On("Enrollment").Return(enrollmentRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
				enrollmentRepo.On("ExistsByCourseID", mock.Anything, courseID).Return(true, nil)
			},
			wantErr: true,
		},
		{
			name: "course not found returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(nil, gorm.ErrRecordNotFound)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			uow, reg := withUow(t)
			if tt.setupMocks != nil {
				tt.setupMocks(t, uow, reg)
			}
			deleteSvc := domain.NewDeleteCourseSvc()
			handler := app.NewDeleteCourseHandler(deleteSvc, uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
