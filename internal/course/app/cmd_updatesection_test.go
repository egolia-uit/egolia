package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestUpdateSectionTitleHandler_Handle(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	sectionID := uuid.New()

	validCmd := &app.UpdateSectionTitle{
		CourseID:  courseID,
		SectionID: sectionID,
		UserID:    "inst-1",
		Title:     "New Title",
	}

	tests := []struct {
		name       string
		cmd        *app.UpdateSectionTitle
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry)
		wantErr    bool
	}{
		{
			name: "valid updates section title and saves",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				section := domain.NewSection(sectionID, "Old Title", nil)
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusDraft, 1000, "overview", false, "video-key", nil, nil,
				)
				course.AddSection(section)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "title already exists in another section returns error",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				sec1 := domain.NewSection(sectionID, "Old Title", nil)
				sec2 := domain.NewSection(uuid.New(), "New Title", nil)
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusDraft, 1000, "overview", false, "video-key", nil, nil,
				)
				course.AddSection(sec1)
				course.AddSection(sec2)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
			},
			wantErr: true,
		},
		{
			name: "section not found returns error",
			cmd: &app.UpdateSectionTitle{
				CourseID:  courseID,
				SectionID: uuid.New(),
				UserID:    "inst-1",
				Title:     "New Title",
			},
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry) {
				section := domain.NewSection(sectionID, "Section 1", nil)
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
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			uow, reg := withUow(t)
			if tt.setupMocks != nil {
				tt.setupMocks(t, uow, reg)
			}
			handler := app.NewUpdateSectionTitleHandler(uow)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
