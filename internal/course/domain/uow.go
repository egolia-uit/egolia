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
	LessonProgress() LessonProgressRepo
	Review() ReviewRepo
	CourseProgress() CourseProgressRepo
}

type UnitOfWork interface {
	Execute(ctx context.Context, fn func(repoRegistry RepoRegistry) error) error
}
