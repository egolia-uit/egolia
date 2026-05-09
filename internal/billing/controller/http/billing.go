package http

import (
	"context"

	"github.com/egolia-uit/egolia/pkg/api/billing"
)

func (h *StrictHandler) GetPlatformRevenueAnalytics(ctx context.Context, request billing.GetPlatformRevenueAnalyticsRequestObject) (billing.GetPlatformRevenueAnalyticsResponseObject, error) {
	return nil, nil
}

//	func (h *StrictHandler) CheckoutCourse(ctx context.Context, request billing.CheckoutCourseRequestObject) (billing.CheckoutCourseResponseObject, error) {
//		user, ok := commonhttp.UserFromContext(ctx)
//		if !ok {
//			return nil, errs.Unauthorized
//		}
//		params := &core.CheckoutCourseParams{
//			CourseID: request.CourseId,
//			UserID:   user.ID,
//		}
//		transaction, err := h.transactionSvc.CheckoutCourse(ctx, *params)
//		if err != nil {
//			return nil, err
//		}
//		return billing.CheckoutCourse204Response{}
//	}
//
// CheckoutCourse implements [billing.StrictServerInterface].

// CheckoutCourse implements [billing.StrictServerInterface].
func (h *StrictHandler) CheckoutCourse(ctx context.Context, request billing.CheckoutCourseRequestObject) (billing.CheckoutCourseResponseObject, error) {
	// user, ok := commonhttp.UserFromContext(ctx)
	// if !ok {
	// 	return nil, errs.Unauthorized
	// }
	// params := &core.CheckoutCourseParams{
	// 	CourseID: request.CourseId,
	// 	UserID:   user.ID,
	// }
	// transaction, err := h.transactionSvc.CheckoutCourse(ctx, *params)
	// if err != nil {
	// 	return nil, err
	// }
	// return toTransactionDTO(transaction), nil
	panic("not implemented")
}

func (h *StrictHandler) GetTransactions(ctx context.Context, request billing.GetTransactionsRequestObject) (billing.GetTransactionsResponseObject, error) {
	return nil, nil
}
