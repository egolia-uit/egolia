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
	ID          uuid.UUID
	UserID      string
	CourseID    uuid.UUID
	CourseTitle string
	Amount      int64
	Status      TransactionStatus
	PaidAt      *time.Time
	UpdatedAt   time.Time
	CreatedAt   time.Time
}

type CheckoutCourseResult struct {
	TransactionID uuid.UUID
	PaymentURL    string
}

type TransactionSvc struct {
	courseSvc       CourseSvc
	identitySvc     IdentitySvc
	transactionRepo TransactionRepo
	paymentGateway  PaymentGateway
}

func NewTransactionSvc(courseSvc CourseSvc, identitySvc IdentitySvc, transactionRepo TransactionRepo, paymentGateway PaymentGateway) *TransactionSvc {
	return &TransactionSvc{
		courseSvc:       courseSvc,
		identitySvc:     identitySvc,
		transactionRepo: transactionRepo,
		paymentGateway:  paymentGateway,
	}
}

type CheckoutCourseParams struct {
	CourseID uuid.UUID
	UserID   string
}

func (s *TransactionSvc) CheckoutCourse(ctx context.Context, params CheckoutCourseParams) (*CheckoutCourseResult, error) {
	course, err := s.courseSvc.GetCourse(ctx, params.CourseID)
	if err != nil {
		return nil, err
	}
	id, err := uuid.NewV7()
	if err != nil {
		return nil, errs.NewInternalGenerateID(err)
	}
	transaction := &Transaction{
		ID:          id,
		UserID:      params.UserID,
		CourseID:    params.CourseID,
		CourseTitle: course.Title,
		Amount:      course.Price,
		Status:      TransactionStatusPending,
		PaidAt:      nil,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := s.transactionRepo.Save(ctx, transaction); err != nil {
		return nil, err
	}

	paymentURL, err := s.paymentGateway.CreatePaymentURL(ctx, transaction)
	if err != nil {
		return nil, err
	}
	return &CheckoutCourseResult{
		TransactionID: id,
		PaymentURL:    paymentURL,
	}, nil
}

func (s *TransactionSvc) ProcessVnpayIPN(ctx context.Context, params VnpayIPNParams) (*VnpayIPNResult, error) {
	if err := s.paymentGateway.VerifyIPN(params.RawValues); err != nil {
		return &VnpayIPNResult{RspCode: "97", Message: "Invalid signature"}, nil
	}

	transaction, err := s.transactionRepo.GetByID(ctx, params.TxnRef)
	if err != nil {
		return &VnpayIPNResult{RspCode: "01", Message: "Order not found"}, nil
	}

	if transaction.Amount*100 != params.Amount {
		return &VnpayIPNResult{RspCode: "04", Message: "Amount invalid"}, nil
	}

	if transaction.Status == TransactionStatusCompleted {
		return &VnpayIPNResult{RspCode: "00", Message: "Confirm Success"}, nil
	}

	if params.ResponseCode != "00" {
		transaction.Status = TransactionStatusFailed
		if err := s.transactionRepo.Save(ctx, transaction); err != nil {
			return nil, err
		}
		return &VnpayIPNResult{RspCode: "00", Message: "Confirm Success"}, nil
	}

	if err := s.courseSvc.EnrollCourseForUser(ctx, transaction.CourseID, transaction.UserID); err != nil {
		return nil, err
	}

	now := time.Now()
	transaction.Status = TransactionStatusCompleted
	transaction.PaidAt = &now
	transaction.UpdatedAt = time.Now()
	if err := s.transactionRepo.Save(ctx, transaction); err != nil {
		return nil, err
	}

	return &VnpayIPNResult{RspCode: "00", Message: "Confirm Success"}, nil
}
