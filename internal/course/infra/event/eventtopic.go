package event

import (
	"fmt"

	"github.com/egolia-uit/egolia/internal/course/domain"
)

func eventToTopic(e domain.DomainEvent) (string, error) {
	switch e.(type) {
	case domain.LessonContentUpdatedEvent:
		return "events.integration.course.lesson.content_updated", nil
	default:
		return "", fmt.Errorf("unknown event type: %T", e)
	}
}
