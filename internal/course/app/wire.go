package app

import "github.com/goforj/wire"

var ProviderSetCmds = wire.NewSet(
	NewCreateCourseHandler,
	NewDeleteCourseHandler,
	NewGetUploadVideoLessonURLHandler,
	NewMoveLessonHandler,
	wire.Struct(new(Cmds), "*"),
)

var ProviderSetQueries = wire.NewSet(
	NewGetCourseDetailHandler,
	NewGetCourseHandler,
	NewGetLessonDetailHandler,
	NewSearchCoursesHandler,
	wire.Struct(new(Queries), "*"),
)

var ProviderSet = wire.NewSet(
	ProviderSetCmds,
	ProviderSetQueries,
	wire.Struct(new(App), "*"),
)
