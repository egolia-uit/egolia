package payment

import (
	"context"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/egolia-uit/egolia/internal/billing/core"
	"github.com/google/uuid"
)

type Vnpay struct {
	baseURL    string
	returnURL  string
	ipnURL     string
	tmnCode    string
	hashSecret string
	version    string
	currency   string
	locale     string
	orderType  string
	payDateFmt string
}

func NewVnpay() *Vnpay {
	baseURL := os.Getenv("VNPAY_URL")
	if baseURL == "" {
		baseURL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
	}
	return &Vnpay{
		baseURL:    baseURL,
		returnURL:  os.Getenv("VNPAY_RETURN_URL"),
		ipnURL:     os.Getenv("VNPAY_IPN_URL"),
		tmnCode:    os.Getenv("VNPAY_TMN_CODE"),
		hashSecret: os.Getenv("VNPAY_HASH_SECRET"),
		version:    valueOrDefault(os.Getenv("VNPAY_VERSION"), "2.1.0"),
		currency:   valueOrDefault(os.Getenv("VNPAY_CURRENCY"), "VND"),
		locale:     valueOrDefault(os.Getenv("VNPAY_LOCALE"), "vn"),
		orderType:  valueOrDefault(os.Getenv("VNPAY_ORDER_TYPE"), "other"),
		payDateFmt: "20060102150405",
	}
}

var _ core.PaymentGateway = (*Vnpay)(nil)

func (v *Vnpay) CreatePaymentURL(ctx context.Context, transaction *core.Transaction) (string, error) {
	if transaction == nil {
		return "", fmt.Errorf("transaction is required")
	}
	if v.tmnCode == "" || v.hashSecret == "" || v.returnURL == "" {
		return fallbackPaymentURL(transaction.ID), nil
	}

	values := url.Values{}
	values.Set("vnp_Version", v.version)
	values.Set("vnp_Command", "pay")
	values.Set("vnp_TmnCode", v.tmnCode)
	values.Set("vnp_Amount", strconv.FormatInt(transaction.Amount*100, 10))
	values.Set("vnp_CurrCode", v.currency)
	values.Set("vnp_TxnRef", transaction.ID.String())
	values.Set("vnp_OrderInfo", fmt.Sprintf("Thanh toan khoa hoc %s", transaction.CourseTitle))
	values.Set("vnp_OrderType", v.orderType)
	values.Set("vnp_Locale", v.locale)
	values.Set("vnp_ReturnUrl", v.returnURL)
	if v.ipnURL != "" {
		values.Set("vnp_IpnUrl", v.ipnURL)
	}
	values.Set("vnp_CreateDate", time.Now().Format(v.payDateFmt))
	values.Set("vnp_ExpireDate", time.Now().Add(15*time.Minute).Format(v.payDateFmt))

	query := canonicalQuery(values)
	signature := sign(v.hashSecret, query)
	values.Set("vnp_SecureHash", signature)

	return v.baseURL + "?" + values.Encode(), nil
}

func (v *Vnpay) VerifyIPN(values url.Values) error {
	if v.tmnCode == "" || v.hashSecret == "" {
		return nil
	}
	secureHash := values.Get("vnp_SecureHash")
	if secureHash == "" {
		return fmt.Errorf("secure hash is required")
	}
	copyValues := cloneValues(values)
	copyValues.Del("vnp_SecureHash")
	copyValues.Del("vnp_SecureHashType")
	if tmnCode := copyValues.Get("vnp_TmnCode"); tmnCode != "" && tmnCode != v.tmnCode {
		return fmt.Errorf("invalid tmn code")
	}
	query := canonicalQuery(copyValues)
	if !strings.EqualFold(secureHash, sign(v.hashSecret, query)) {
		return fmt.Errorf("invalid signature")
	}
	return nil
}

func fallbackPaymentURL(transactionID uuid.UUID) string {
	return fmt.Sprintf("/billing/transactions/%s", transactionID.String())
}

func canonicalQuery(values url.Values) string {
	keys := make([]string, 0, len(values))
	for key := range values {
		if key == "vnp_SecureHash" || key == "vnp_SecureHashType" {
			continue
		}
		keys = append(keys, key)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, url.QueryEscape(key)+"="+url.QueryEscape(values.Get(key)))
	}
	return strings.Join(parts, "&")
}

func sign(secret string, data string) string {
	mac := hmac.New(sha512.New, []byte(secret))
	_, _ = mac.Write([]byte(data))
	return hex.EncodeToString(mac.Sum(nil))
}

func cloneValues(values url.Values) url.Values {
	result := url.Values{}
	for key, items := range values {
		result[key] = append([]string(nil), items...)
	}
	return result
}

func valueOrDefault(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
