package event

import (
	"github.com/ThreeDotsLabs/watermill"
	"github.com/ThreeDotsLabs/watermill-kafka/v3/pkg/kafka"
	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/egolia-uit/egolia/internal/course/config"
	"github.com/egolia-uit/egolia/pkg/otel"
	wotel "github.com/nkonev/watermill-opentelemetry/pkg/opentelemetry"
)

func NewKafkaPublisher(
	cfg *config.Config,
	tracer *otel.WatermillKafkaTracer,
	logger watermill.LoggerAdapter,
) (message.Publisher, error) {
	publisher, err := kafka.NewPublisher(
		kafka.PublisherConfig{
			Brokers: cfg.Kafka.Brokers,
			Tracer:  tracer,
		},
		logger,
	)
	if err != nil {
		return nil, err
	}
	return wotel.NewNamedPublisherDecorator("course", publisher), nil
}
