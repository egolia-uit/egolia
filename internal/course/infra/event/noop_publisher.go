package event

import "github.com/ThreeDotsLabs/watermill/message"

// NewNoopPublisher returns a message.Publisher that discards every message.
// TODO: revert to NewKafkaPublisher once a Kafka broker is available locally.
func NewNoopPublisher() (message.Publisher, error) {
	return &noopPublisher{}, nil
}

type noopPublisher struct{}

func (*noopPublisher) Publish(_ string, _ ...*message.Message) error {
	return nil
}

func (*noopPublisher) Close() error {
	return nil
}
