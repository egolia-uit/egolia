package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestCreateCourseHandler_Handle(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	validCmd := &app.CreateCourse{
		ID:                   courseID,
		Title:                "Go Basics",
		InstructorID:         "inst-1",
		Price:                1000,
		Overview:             "An overview",
		IntroductionVideoKey: "intro-key",
	}

	tests := []struct {
		name       string
		cmd        *app.CreateCourse
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "valid command creates course and saves",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "empty title returns validation error",
			cmd: &app.CreateCourse{
				ID:                   uuid.New(),
				Title:                "",
				InstructorID:         "inst-1",
				Price:                1000,
				Overview:             "",
				IntroductionVideoKey: "",
			},
			setupMocks: nil,
			wantErr:    true,
		},
		{
			name: "save fails returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(assert.AnError)
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
			handler := app.NewCreateCourseHandler(uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
