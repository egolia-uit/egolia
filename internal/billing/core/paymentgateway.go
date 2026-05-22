package core

import (
	"context"
	"net/url"

	"github.com/google/uuid"
)

type PaymentGateway interface {
	CreatePaymentURL(ctx context.Context, transaction *Transaction) (string, error)
	VerifyIPN(values url.Values) error
}

type VnpayIPNParams struct {
	Amount            int64
	BankCode          string
	BankTranNo        string
	CardType          string
	OrderInfo         string
	PayDate           string
	ResponseCode      string
	SecureHash        string
	TmnCode           string
	TransactionNo     string
	TransactionStatus string
	TxnRef            uuid.UUID
	RawValues         url.Values
}

type VnpayIPNResult struct {
	RspCode string
	Message string
}
