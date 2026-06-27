package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestApproveCourseHandler_Handle(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()

	validCmd := &app.ApproveCourse{
		CourseID: courseID,
	}

	tests := []struct {
		name       string
		cmd        *app.ApproveCourse
		setupMocks func(*testing.T, *mockUow, *tSafeRepoRegistry, *app.MockEventPublisher)
		wantErr    bool
	}{
		{
			name: "no draft approves and saves course",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry, publisher *app.MockEventPublisher) {
				course := domain.UnmarshalCourse(
					courseID, nil, "Test Course", "inst-1",
					domain.CourseStatusPending, 1000, "overview", false, "video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(course, nil)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(nil)
			},
			wantErr: false,
		},
		{
			name: "has draft merges and saves both courses",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry, publisher *app.MockEventPublisher) {
				originalCourseID := uuid.New()
				draft := domain.UnmarshalCourse(
					courseID, &originalCourseID, "Draft Title", "inst-1",
					domain.CourseStatusDraft, 2000, "draft overview", false, "draft-video-key", nil, nil,
				)
				originalCourse := domain.UnmarshalCourse(
					originalCourseID, nil, "Original Title", "inst-1",
					domain.CourseStatusApproved, 1000, "original overview", false, "original-video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(draft, nil)
				courseRepo.On("GetFull", mock.Anything, originalCourseID).Return(originalCourse, nil)
				courseRepo.On("Save", mock.Anything, mock.Anything).Return(nil).Times(2)
				publisher.On("Publish", mock.Anything, mock.Anything).Return(nil).Maybe()
			},
			wantErr: false,
		},
		{
			name: "merge error propagates",
			cmd:  validCmd,
			setupMocks: func(t *testing.T, uow *mockUow, reg *tSafeRepoRegistry, publisher *app.MockEventPublisher) {
				mismatchedID := uuid.New()
				originalCourseID := uuid.New()
				draft := domain.UnmarshalCourse(
					courseID, &mismatchedID, "Draft Title", "inst-1",
					domain.CourseStatusDraft, 2000, "draft overview", false, "draft-video-key", nil, nil,
				)
				originalCourse := domain.UnmarshalCourse(
					originalCourseID, nil, "Original Title", "inst-1",
					domain.CourseStatusApproved, 1000, "original overview", false, "original-video-key", nil, nil,
				)
				courseRepo := domain.NewMockCourseRepo(t)
				reg.On("Course").Return(courseRepo)
				courseRepo.On("GetFull", mock.Anything, courseID).Return(draft, nil)
				courseRepo.On("GetFull", mock.Anything, mismatchedID).Return(originalCourse, nil)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			uow, reg := withUow(t)
			publisher := app.NewMockEventPublisher(t)
			if tt.setupMocks != nil {
				tt.setupMocks(t, uow, reg, publisher)
			}
			handler := app.NewApproveCourseHandler(uow, publisher)
			err := handler.Handle(ctx, tt.cmd)
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
