package domain

type DomainEvent interface {
	EventName() string
}

type LessonContentUpdatedEvent struct {
	CourseID string
	LessonID string
}

func (e LessonContentUpdatedEvent) EventName() string {
	return "LessonContentUpdated"
}
