package app

import (
	"context"

	"github.com/egolia-uit/egolia/internal/course/domain"
)

type EventPublisher interface {
	Publish(ctx context.Context, events ...domain.DomainEvent) error
}
