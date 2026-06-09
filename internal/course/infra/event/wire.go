package event

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	NewKafkaPublisher,
	NewKafkaEventPublisher,
	wire.Bind(new(app.EventPublisher), new(*KafkaEventPublisher)),
)
