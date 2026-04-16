package app

import "github.com/goforj/wire"

var ProviderSetCmds = wire.NewSet(
	NewMoveLessonHandler,
	wire.Struct(new(Cmds), "*"),
)

var ProviderSetQueries = wire.NewSet(
	NewGetCourseDetailHandler,
	NewGetCourseMetadataHandler,
	NewGetLessonDetailHandler,
	NewGetUploadVideoLessonURLHandler,
	NewSearchCoursesHandler,
	wire.Struct(new(Queries), "*"),
)

var ProviderSet = wire.NewSet(
	ProviderSetCmds,
	ProviderSetQueries,
	wire.Struct(new(App), "*"),
)
