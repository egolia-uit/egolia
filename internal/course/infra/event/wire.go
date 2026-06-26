package event

import (
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/goforj/wire"
)

var ProviderSet = wire.NewSet(
	// TODO: revert to NewKafkaPublisher once a Kafka broker is available locally.
	NewNoopPublisher,
	NewKafkaEventPublisher,
	wire.Bind(new(app.EventPublisher), new(*KafkaEventPublisher)),
)
