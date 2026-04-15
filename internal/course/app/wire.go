package app

import "github.com/goforj/wire"

var ProviderSetCmds = wire.NewSet(
	NewMoveLessonHandler,
	wire.Struct(new(Cmds), "*"),
)

var ProviderSet = wire.NewSet(
	ProviderSetCmds,
	wire.Struct(new(App), "*"),
)
