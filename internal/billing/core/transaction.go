package core

import (
	"context"
	"time"

	"github.com/egolia-uit/egolia/internal/billing/errs"
	"github.com/google/uuid"
)

type TransactionStatus string

const (
	TransactionStatusPending   TransactionStatus = "pending"
	TransactionStatusCompleted TransactionStatus = "completed"
	TransactionStatusFailed    TransactionStatus = "failed"
)

type Transaction struct {
	ID          uuid.UUID         `gorm:"type:uuid;primaryKey"`
	UserID      string            `gorm:"type:text;not null"`
	Username    string            `gorm:"-"`
	UserEmail   string            `gorm:"-"`
	CourseID    uuid.UUID         `gorm:"type:uuid;not null"`
	CourseTitle string            `gorm:"-"`
	Amount      int64             `gorm:"not null"`
	Status      TransactionStatus `gorm:"type:text;not null"`
	CreatedAt   time.Time
}

type TransactionSvc struct {
	courseSvc   CourseSvc
	identitySvc IdentitySvc
}

func NewTransactionSvc(courseSvc CourseSvc, identitySvc IdentitySvc) *TransactionSvc {
	return &TransactionSvc{
		courseSvc:   courseSvc,
		identitySvc: identitySvc,
	}
}

type CheckoutCourseParams struct {
	CourseID uuid.UUID
	UserID   string
}

func (s *TransactionSvc) CheckoutCourse(ctx context.Context, params CheckoutCourseParams) (*Transaction, error) {
	course, err := s.courseSvc.GetCourse(ctx, params.CourseID)
	if err != nil {
		return nil, err
	}
	id, err := uuid.NewV7()
	if err != nil {
		return nil, errs.NewInternalGenerateID(err)
	}
	user, err := s.identitySvc.GetUser(ctx, params.UserID)
	if err != nil {
		return nil, err
	}
	transaction := &Transaction{
		ID:          id,
		UserID:      params.UserID,
		Username:    user.Name,
		UserEmail:   user.Email,
		CourseID:    params.CourseID,
		CourseTitle: course.Title,
		Amount:      course.Price,
		Status:      TransactionStatusPending,
		CreatedAt:   time.Now(),
	}
	return transaction, nil
}
