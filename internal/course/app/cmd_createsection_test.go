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

func TestCreateSectionHandler_Handle(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	validCmd := &app.CreateSection{
		CourseID: courseID,
		Title:    "Introduction",
	}

	tests := []struct {
		name       string
		cmd        *app.CreateSection
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "valid creates section and saves course",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusDraft, 1000, "overview", false, "video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "duplicate section title returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				section := domain.NewSection(uuid.New(), "Introduction", nil)
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusDraft, 1000, "overview", false, "video-key", nil, nil,
				)
				course.AddSection(section)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
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
		{
			name: "unauthorized instructor returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusApproved, 1000, "overview", false, "video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
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
			handler := app.NewCreateSectionHandler(uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
