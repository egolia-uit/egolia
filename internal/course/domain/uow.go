package domain

import (
	"context"
)

type RepoRegistry interface {
	Bookmark() BookmarkRepo
	Certificate() CertificateRepo
	Course() CourseRepo
	Enrollment() EnrollmentRepo
	LessonComment() LessonCommentRepo
	// LessonProgressTest() LessonProgressTestRepo
	// LessonProgressVideo() LessonProgressVideoRepo
	Lesson() LessonRepo
	Review() ReviewRepo
	SectionRepo() SectionRepo
	TestLessonRepo() TestLessonRepo
	VideoLessonRepo() VideoLessonRepo
}

type UnitOfWork interface {
	Execute(ctx context.Context, fn func(repoRegistry RepoRegistry) error) error
}
