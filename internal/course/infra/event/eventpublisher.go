package event

import (
	"context"
	"encoding/json"

	"github.com/ThreeDotsLabs/watermill/message"
	"github.com/egolia-uit/egolia/internal/course/app"
	"github.com/egolia-uit/egolia/internal/course/domain"
	"github.com/google/uuid"
)

type KafkaEventPublisher struct {
	publisher message.Publisher
}

var _ app.EventPublisher = (*KafkaEventPublisher)(nil)

func NewKafkaEventPublisher(publisher message.Publisher) *KafkaEventPublisher {
	return &KafkaEventPublisher{publisher: publisher}
}

func (p *KafkaEventPublisher) Publish(_ context.Context, events ...domain.DomainEvent) error {
	for _, e := range events {
		topic, err := eventToTopic(e)
		if err != nil {
			return err
		}
		payload, err := json.Marshal(e)
		if err != nil {
			return err
		}
		msg := message.NewMessage(uuid.New().String(), payload)
		if err := p.publisher.Publish(topic, msg); err != nil {
			return err
		}
	}
	return nil
}
