package objectstorage

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/goforj/wire"
)

var S3ProviderSet = wire.NewSet(
	NewS3,
	wire.Bind(new(app.ObjectStorageSvc), new(*S3)),
)
