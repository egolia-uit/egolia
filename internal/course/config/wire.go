package config

import "github.com/goforj/wire"

var ProviderSet = wire.NewSet(
	New,
	wire.FieldsOf(
		new(*Config),
		"General",
		"Log",
		"Server",
		"Database",
		"Authentik",
		"S3",
		"Services",
	),
)
