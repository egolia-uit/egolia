package domain

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	id        uuid.UUID
	courseID  uuid.UUID
	userID    string
	rating    int
	comment   string
	deletedAt *time.Time
}

func NewReview(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	rating int,
	comment string,
) *Review {
	return &Review{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		rating:    rating,
		comment:   comment,
		deletedAt: nil,
	}
}

func UnmarshalReview(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	rating int,
	comment string,
	deletedAt *time.Time,
) *Review {
	return &Review{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		rating:    rating,
		comment:   comment,
		deletedAt: deletedAt,
	}
}

func (r *Review) ID() uuid.UUID {
	return r.id
}

func (r *Review) CourseID() uuid.UUID {
	return r.courseID
}

func (r *Review) UserID() string {
	return r.userID
}

func (r *Review) Rating() int {
	return r.rating
}

func (r *Review) SetRating(rating int) {
	r.rating = rating
}

func (r *Review) Comment() string {
	return r.comment
}

func (r *Review) SetComment(comment string) {
	r.comment = comment
}

func (r *Review) DeletedAt() *time.Time {
	return r.deletedAt
}

func (r *Review) Delete() {
	r.deletedAt = new(time.Time)
	*r.deletedAt = time.Now()
}
