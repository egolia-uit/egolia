package domain

import "github.com/google/uuid"

type Bookmark struct {
	id       uuid.UUID
	userID   string
	courseID uuid.UUID
}

func NewBookmark(
	id uuid.UUID,
	userID string,
	courseID uuid.UUID,
) *Bookmark {
	return &Bookmark{
		id:       id,
		userID:   userID,
		courseID: courseID,
	}
}

func UnmarshalBookmark(
	id uuid.UUID,
	userID string,
	courseID uuid.UUID,
) *Bookmark {
	return &Bookmark{
		id:       id,
		userID:   userID,
		courseID: courseID,
	}
}

func (b *Bookmark) ID() uuid.UUID {
	return b.id
}

func (b *Bookmark) UserID() string {
	return b.userID
}

func (b *Bookmark) CourseID() uuid.UUID {
	return b.courseID
}
