package persistence

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/readmodel"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/repo"
	"github.com/goforj/wire"
)

var ReadModelProviderSet = wire.NewSet(
	readmodel.NewCourseReadRepo,
	readmodel.NewLessonReadRepo,
	readmodel.NewReviewReadRepo,
	readmodel.NewCertificateReadRepo,
	wire.Bind(new(app.GetCourseReadModel), new(*readmodel.CourseReadRepo)),
	wire.Bind(new(app.GetCoursesReadModel), new(*readmodel.CourseReadRepo)),
	wire.Bind(new(app.GetCourseDetailReadModel), new(*readmodel.CourseReadRepo)),
	wire.Bind(new(app.GetLessonDetailReadModel), new(*readmodel.LessonReadRepo)),
	wire.Bind(new(app.GetCourseReviewsReadModel), new(*readmodel.ReviewReadRepo)),
	wire.Bind(new(app.GetMyCertificatesReadModel), new(*readmodel.CertificateReadRepo)),
)

var RepoProviderSet = wire.NewSet(
	repo.NewBookmarkRepo,
	repo.NewCertificateRepo,
	repo.NewCourseRepo,
	repo.NewEnrollmentRepo,
	repo.NewLessonCommentRepo,
	repo.NewRegistry,
	repo.NewReviewRepo,
	repo.NewUnitOfWork,
	wire.Bind(new(domain.BookmarkRepo), new(*repo.BookmarkRepo)),
	wire.Bind(new(domain.CertificateRepo), new(*repo.CertificateRepo)),
	wire.Bind(new(domain.CourseRepo), new(*repo.CourseRepo)),
	wire.Bind(new(domain.EnrollmentRepo), new(*repo.EnrollmentRepo)),
	wire.Bind(new(domain.LessonCommentRepo), new(*repo.LessonCommentRepo)),
	wire.Bind(new(domain.ReviewRepo), new(*repo.ReviewRepo)),
	wire.Bind(new(domain.UnitOfWork), new(*repo.UnitOfWork)),
)

var ProviderSet = wire.NewSet(
	NewDB,
	NewPG,
	ReadModelProviderSet,
	RepoProviderSet,
)
