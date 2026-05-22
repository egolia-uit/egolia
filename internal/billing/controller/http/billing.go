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
	user, ok := commonhttp.UserFromContext(ctx)
	if !ok {
		return nil, errs.Unauthorized
	}
	params := &core.CheckoutCourseParams{
		CourseID: request.CourseId,
		UserID:   user.ID,
	}
	transaction, err := h.transactionSvc.CheckoutCourse(ctx, *params)
	if err != nil {
		return nil, err
	}
	return billing.CheckoutCourse201JSONResponse{
		TransactionId: transaction.TransactionID,
		PaymentUrl:    transaction.PaymentURL,
	}, nil
}

func (h *StrictHandler) GetTransactions(ctx context.Context, request billing.GetTransactionsRequestObject) (billing.GetTransactionsResponseObject, error) {
	return nil, nil
}

// type VnpayIPNParams struct {
// 	Amount            int64
// 	BankCode          string
// 	BankTranNo        string
// 	CardType          string
// 	OrderInfo         string
// 	PayDate           string
// 	ResponseCode      string
// 	SecureHash        string
// 	TmnCode           string
// 	TransactionNo     string
// 	TransactionStatus string
// 	TxnRef            uuid.UUID
// 	RawValues         url.Values
// }

// VnpayIpn implements [billing.StrictServerInterface].
func (h *StrictHandler) VnpayIpn(ctx context.Context, request billing.VnpayIpnRequestObject) (billing.VnpayIpnResponseObject, error) {
	result, err := h.transactionSvc.ProcessVnpayIPN(ctx, core.VnpayIPNParams{
		Amount:            request.Params.VnpAmount,
		BankCode:          *request.Params.VnpBankCode,
		BankTranNo:        *request.Params.VnpBankTranNo,
		CardType:          *request.Params.VnpCardType,
		OrderInfo:         *request.Params.VnpOrderInfo,
		PayDate:           *request.Params.VnpPayDate,
		ResponseCode:      request.Params.VnpResponseCode,
		SecureHash:        request.Params.VnpSecureHash,
		TmnCode:           *request.Params.VnpTmnCode,
		TransactionNo:     *request.Params.VnpTransactionNo,
		TransactionStatus: *request.Params.VnpTransactionStatus,
		TxnRef:            request.Params.VnpTxnRef,
		RawValues:         h.BaseURL.Query(),
	})
	if err != nil {
		return nil, err
	}
	return billing.VnpayIpn200JSONResponse{
		RspCode: result.RspCode,
		Message: result.Message,
	}, nil
}
