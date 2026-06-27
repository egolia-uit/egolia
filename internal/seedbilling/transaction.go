package seedbilling

import (
	"time"

	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/internal/billing/infra/persistence/model"
	"github.com/google/uuid"
)

func (s *Seed) createTransactions() []model.Transaction {
	now := time.Now()
	paidAt := now

	flowchartCourseID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	return []model.Transaction{
		{
			ID:          uuid.MustParse("00000000-0000-0000-0001-000000000001"),
			UserID:      "110",
			CourseID:    flowchartCourseID,
			CourseTitle: "FlowChart - Chuyên đề Lưu đồ Thuật toán",
			Amount:      120000,
			Status:      core.TransactionStatusCompleted,
			PaidAt:      &paidAt,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          uuid.MustParse("00000000-0000-0000-0001-000000000002"),
			UserID:      "110",
			CourseID:    flowchartCourseID,
			CourseTitle: "FlowChart - Chuyên đề Lưu đồ Thuật toán",
			Amount:      120000,
			Status:      core.TransactionStatusPending,
			PaidAt:      nil,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}
}
