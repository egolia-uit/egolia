package model

import (
	"time"

	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/google/uuid"
)

type Transaction struct {
	ID          uuid.UUID              `gorm:"type:uuid;primaryKey"`
	UserID      string                 `gorm:"column:user_id;type:text;not null"`
	CourseID    uuid.UUID              `gorm:"column:course_id;type:uuid;not null"`
	CourseTitle string                 `gorm:"column:course_title;type:text;not null"`
	Amount      int64                  `gorm:"type:bigint;not null"`
	Status      core.TransactionStatus `gorm:"type:text;not null"`
	PaidAt      *time.Time             `gorm:"column:paid_at"`
	CreatedAt   time.Time              `gorm:"autoCreateTime"`
	UpdatedAt   time.Time              `gorm:"autoUpdateTime"`
}

func (Transaction) TableName() string {
	return "transactions"
}

func TransactionFromDomain(transaction *core.Transaction) *Transaction {
	return &Transaction{
		ID:          transaction.ID,
		UserID:      transaction.UserID,
		CourseID:    transaction.CourseID,
		CourseTitle: transaction.CourseTitle,
		Amount:      transaction.Amount,
		Status:      transaction.Status,
		PaidAt:      transaction.PaidAt,
		UpdatedAt:   transaction.UpdatedAt,
		CreatedAt:   transaction.CreatedAt,
	}
}

func (m *Transaction) ToDomain() *core.Transaction {
	return &core.Transaction{
		ID:          m.ID,
		UserID:      m.UserID,
		CourseID:    m.CourseID,
		CourseTitle: m.CourseTitle,
		Amount:      m.Amount,
		Status:      m.Status,
		PaidAt:      m.PaidAt,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
