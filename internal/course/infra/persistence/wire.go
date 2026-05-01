package persistence

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/readmodel"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence/repo"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewDB,
	repo.NewRegistry,
	repo.NewUnitOfWork,
	wire.Bind(new(domain.RepoRegistry), new(*repo.Registry)),
	wire.Bind(new(domain.UnitOfWork), new(*repo.UnitOfWork)),

	readmodel.NewCourseReadRepo,
	readmodel.NewLessonReadRepo,
	wire.Bind(new(app.GetCourseReadModel), new(*readmodel.CourseReadRepo)),
	wire.Bind(new(app.SearchCoursesReadModel), new(*readmodel.CourseReadRepo)),
	wire.Bind(new(app.GetCourseDetailReadModel), new(*readmodel.CourseReadRepo)),
	wire.Bind(new(app.GetLessonDetailReadModel), new(*readmodel.LessonReadRepo)),
)
