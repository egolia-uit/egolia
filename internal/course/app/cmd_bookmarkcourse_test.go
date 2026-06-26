package app_test

import (
	"testing"

	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/errs"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestBookmarkCourseHandler(t *testing.T) {
	t.Parallel()

	courseID := uuid.New()
	userID := "user-1"

	tests := []struct {
		name    string
		setup   func(t *testing.T, reg *tSafeRepoRegistry) (*domain.MockCourseRepo, *domain.MockBookmarkRepo)
		wantErr require.ErrorAssertionFunc
	}{
		{
			name: "not bookmarked, published course -> BookmarkRepo.Save called",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) (*domain.MockCourseRepo, *domain.MockBookmarkRepo) {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", userID, domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				mockBookmark := domain.NewMockBookmarkRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				reg.EXPECT().Bookmark().Return(mockBookmark)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockBookmark.EXPECT().ExistsByUserAndCourse(ctx, userID, courseID).Return(false, nil)
				mockBookmark.EXPECT().Save(ctx, mock.Anything).Return(nil)
				return mockCourse, mockBookmark
			},
			wantErr: require.NoError,
		},
		{
			name: "already bookmarked -> BookmarkRepo.DeleteByUserAndCourse called",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) (*domain.MockCourseRepo, *domain.MockBookmarkRepo) {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", userID, domain.CourseStatusApproved, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				mockBookmark := domain.NewMockBookmarkRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				reg.EXPECT().Bookmark().Return(mockBookmark)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				mockBookmark.EXPECT().ExistsByUserAndCourse(ctx, userID, courseID).Return(true, nil)
				mockBookmark.EXPECT().DeleteByUserAndCourse(ctx, userID, courseID).Return(nil)
				return mockCourse, mockBookmark
			},
			wantErr: require.NoError,
		},
		{
			name: "course not published -> error",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) (*domain.MockCourseRepo, *domain.MockBookmarkRepo) {
				t.Helper()
				course := domain.UnmarshalCourse(courseID, nil, "Test Course", userID, domain.CourseStatusDraft, 0, "", false, "", nil, nil)
				mockCourse := domain.NewMockCourseRepo(t)
				mockBookmark := domain.NewMockBookmarkRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(course, nil)
				return mockCourse, mockBookmark
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var notPublished *errs.CourseNotPublished
				require.ErrorAs(tt, err, &notPublished)
			},
		},
		{
			name: "course not found -> error",
			setup: func(t *testing.T, reg *tSafeRepoRegistry) (*domain.MockCourseRepo, *domain.MockBookmarkRepo) {
				t.Helper()
				mockCourse := domain.NewMockCourseRepo(t)
				mockBookmark := domain.NewMockBookmarkRepo(t)
				reg.EXPECT().Course().Return(mockCourse)
				mockCourse.EXPECT().GetFull(ctx, courseID).Return(nil, gorm.ErrRecordNotFound)
				return mockCourse, mockBookmark
			},
			wantErr: func(tt require.TestingT, err error, i ...interface{}) {
				require.Error(tt, err)
				var notFound *errs.CourseNotFound
				require.ErrorAs(tt, err, &notFound)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			reg := newRepoRegistry(t)
			uow := &mockUow{reg: reg}
			_, _ = tc.setup(t, reg)
			handler := app.NewBookmarkCourseHandler(uow)
			err := handler.Handle(ctx, &app.BookmarkCourse{
				CourseID: courseID,
				UserID:   userID,
			})
			tc.wantErr(t, err)
		})
	}
}
