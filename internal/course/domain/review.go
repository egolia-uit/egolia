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
	createdAt *time.Time
	deletedAt *time.Time
}

func NewReview(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	rating int,
	comment string,
	createdAt *time.Time,
) *Review {
	return &Review{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		rating:    rating,
		comment:   comment,
		createdAt: createdAt,
		deletedAt: nil,
	}
}

func UnmarshalReview(
	id uuid.UUID,
	courseID uuid.UUID,
	userID string,
	rating int,
	comment string,
	createdAt *time.Time,
	deletedAt *time.Time,
) *Review {
	return &Review{
		id:        id,
		courseID:  courseID,
		userID:    userID,
		rating:    rating,
		comment:   comment,
		createdAt: createdAt,
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

func (r *Review) CreatedAt() *time.Time {
	return r.createdAt
}

func (r *Review) SetCreatedAt(createdAt *time.Time) {
	r.createdAt = createdAt
}
