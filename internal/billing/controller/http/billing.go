package http

import (
	"context"

	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/egolia-uit/egolia/internal/billing/errs"
	"github.com/egolia-uit/egolia/pkg/api/billing"
	commonhttp "github.com/egolia-uit/egolia/pkg/common/http"
)

func (h *StrictHandler) GetPlatformRevenueAnalytics(ctx context.Context, request billing.GetPlatformRevenueAnalyticsRequestObject) (billing.GetPlatformRevenueAnalyticsResponseObject, error) {
	return nil, nil
}

func (h *StrictHandler) CheckoutCourse(ctx context.Context, request billing.CheckoutCourseRequestObject) (billing.CheckoutCourseResponseObject, error) {
	user, ok := commonhttp.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	params := &core.CheckoutCourseParams{
		CourseID: *request.Body.Id,
		UserID:   user.ID,
	}
	transaction, err := h.transactionSvc.CheckoutCourse(ctx, *params)
	if err != nil {
		return nil, err
	}
	return billing.CheckoutCourse201JSONResponse(toTransactionDTO(transaction)), nil
}

func (h *StrictHandler) GetTransactions(ctx context.Context, request billing.GetTransactionsRequestObject) (billing.GetTransactionsResponseObject, error) {
	return nil, nil
}

func (h *StrictHandler) CompleteTransaction(ctx context.Context, request billing.CompleteTransactionRequestObject) (billing.CompleteTransactionResponseObject, error) {
	return nil, nil
}
