package http

import (
	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/pkg/api/billing"
)

func toTransactionDTO(transaction *core.Transaction) billing.Transaction {
	return billing.Transaction{
		Id:        &transaction.ID,
		UserId:    transaction.UserID,
		CourseId:  transaction.CourseID,
		Amount:    &transaction.Amount,
		Status:    toTransactionStatusDTO(transaction.Status),
		CreatedAt: &transaction.CreatedAt,
	}
}

func toTransactionStatusDTO(status core.TransactionStatus) billing.TransactionStatus {
	switch status {
	case core.TransactionStatusPending:
		return billing.Pending
	case core.TransactionStatusCompleted:
		return billing.Completed
	case core.TransactionStatusFailed:
		return billing.Failed
	default:
		panic("unknown transaction status: " + string(status))
	}
}
