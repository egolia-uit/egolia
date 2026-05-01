package infra

import (
	"github.com/egolia-uit/egolia/internal/course/infra/objectstorage"
	"github.com/egolia-uit/egolia/internal/course/infra/persistence"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	objectstorage.S3ProviderSet,
	persistence.ProviderSet,
)
