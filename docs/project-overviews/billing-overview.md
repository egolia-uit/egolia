# Billing Service — Project Overview

## General Information

| Field | Value |
|-------|-------|
| **Project** | Egolia Billing Service |
| **Location** | `internal/billing/` + `cmd/billing/` |
| **Architecture** | Layered (domain model in core, GORM in infra) |
| **Language** | Go |
| **Build System** | Nx (`pnpm nx build billing`) |
| **Database** | PostgreSQL (via GORM, `transactions` table) |
| **External Services** | VNPay (payment gateway), Course service (gRPC), Authentik (identity) |
| **Testing Status** | ⚪ No tests (mocks: partial) |

## Directory Structure

```
internal/billing/
├── component/
│   └── validator.go           # go-playground/validator
├── config/
│   ├── config.go              # Config, Server, Services
│   ├── viper.go               # Viper loading (prefix EGOLIA_BILLING_)
│   └── wire.go
├── controller/
│   ├── http/
│   │   ├── http.go            # StrictHandler, RegisterRoutes
│   │   ├── billing.go         # CheckoutCourse, VnpayIpn handlers
│   │   ├── err.go             # Error → HTTP status mapping
│   │   ├── mapout.go          # Response mapping utilities
│   │   └── wire.go
│   └── health/
│       ├── health.go          # Health check endpoints
│       └── wire.go
├── core/                      # Business logic layer
│   ├── coursesvc.go           # CourseSvc interface, Course model
│   ├── identitysvc.go         # IdentitySvc interface, User model
│   ├── mock.go                # MockCourseSvc, MockIdentitySvc (mockery-generated)
│   ├── paymentgateway.go      # PaymentGateway interface, VNPay params/results
│   ├── revenueanalytic.go     # RevenueAnalytic model
│   ├── transaction.go         # Transaction model, TransactionSvc
│   ├── transactionrepo.go     # TransactionRepo interface
│   └── wire.go
├── errs/                      # Custom error types
│   ├── common.go              # Error interface, Err struct, codes
│   └── course.go              # Course-specific errors
├── infra/                     # External concerns
│   ├── identity/
│   │   ├── authentik.go       # Authentik API client
│   │   └── wire.go
│   ├── payment/
│   │   ├── vnpay.go           # VNPay payment gateway implementation
│   │   └── wire.go
│   ├── persistence/
│   │   ├── db.go              # GORM DB setup
│   │   ├── pg.go              # AutoMigrate + PG wrapper
│   │   ├── model/transaction.go  # GORM model with domain converters
│   │   └── repo/transaction.go   # TransactionRepo GORM implementation
│   └── service/
│       ├── course.go          # gRPC Course service client
│       └── wire.go
├── flow.txt                   # Payment flow documentation
├── server.go                  # Server struct, Run method
└── wire.go                    # Top-level ProviderSet

cmd/billing/
├── .mockery.yaml              # Mockery config (CourseSvc, IdentitySvc)
├── Dockerfile
├── main.go                    # Entry point
├── metadata.go
├── project.json
├── test.sh                    # gotestsum test runner
├── wire.go                    # Wire DI assembly
└── wire_gen.go                # Generated wire code
```

## Domain Models

### Transaction (`core/transaction.go`)
```go
type TransactionStatus string  // "pending" | "completed" | "failed"

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
```

### Course (`core/coursesvc.go`)
```go
type Course struct {
    ID           uuid.UUID
    Title        string
    InstructorID string
    Price        int64
}
```

### User (`core/identitysvc.go`)
```go
type User struct {
    ID    string
    Name  string
    Email string
}
```

## Interfaces

### TransactionRepo (`core/transactionrepo.go`)
```go
type TransactionRepo interface {
    GetByID(ctx context.Context, id uuid.UUID) (*Transaction, error)
    Save(ctx context.Context, transaction *Transaction) error
}
```

### CourseSvc (`core/coursesvc.go`)
```go
type CourseSvc interface {
    GetCourse(ctx context.Context, id uuid.UUID) (*Course, error)
    EnrollCourseForUser(ctx context.Context, courseID uuid.UUID, userID string) error
}
```

### IdentitySvc (`core/identitysvc.go`)
```go
type IdentitySvc interface {
    GetUser(ctx context.Context, id string) (*User, error)
    GetUsers(ctx context.Context, ids []string) ([]*User, error)
}
```

### PaymentGateway (`core/paymentgateway.go`)
```go
type PaymentGateway interface {
    CreatePaymentURL(ctx context.Context, transaction *Transaction, ipAddr string) (string, error)
    VerifyIPN(params VnpayIPNParams) (*VnpayIPNResult, error)
}
```

## Core Service: TransactionSvc

### `CheckoutCourse(ctx, params) → (*CheckoutCourseResult, error)`
Flow:
1. Call `courseSvc.GetCourse()` — fetch course details
2. Validate course exists
3. Generate UUID for transaction
4. Build Transaction domain object (status: pending)
5. Call `txRepo.Save()` — persist transaction
6. Call `paymentGateway.CreatePaymentURL()` — get payment URL
7. Return `CheckoutCourseResult{TransactionID, PaymentURL}`

### `ProcessVnpayIPN(ctx, params) → (*VnpayIPNResult, error)`
Flow:
1. Call `paymentGateway.VerifyIPN()` — HMAC signature verification
2. Look up transaction by ID from `params.TxnRef`
3. Check transaction found — if not, return "Order not found"
4. Check amount match — if mismatch, return "Amount mismatch"
5. Check status — if already completed, return "Order already confirmed"
6. If `vnp_TransactionStatus == "00"` → status = completed, call `courseSvc.EnrollCourseForUser()`, set `PaidAt`
7. If not "00" → status = failed
8. Save updated transaction
9. Return success result

## Error Handling

### Error Codes
| Code | HTTP Status | Usage |
|------|-------------|-------|
| `unauthorized` | 401 | Authentication failure |
| `forbidden` | 403 | Permission denied |
| `invalid` | 400 | Validation failure |
| `unimplemented` | 501 | Not yet implemented |
| `internal` | 500 | Generic internal error |
| `internalGenerateId` | 500 | UUID generation failure |
| `courseSvcInternal` | 500 | Course service gRPC error |
| `courseNotFound` | 404 | Course not found |

## API Endpoints

| Method | Route | Implementation | Auth |
|--------|-------|---------------|------|
| `POST` | `/billing/courses/{courseId}/checkout` | ✅ Implemented | OAuth2 |
| `GET` | `/billing/transactions/vnpay_ipn` | ✅ Implemented | None (IPN) |
| `GET` | `/billing/transactions` | ❌ Not implemented | OAuth2 |
| `GET` | `/billing/admin/analytics/revenue` | ❌ Not implemented | OAuth2 |

## Mocking Status

### Existing Mocks (`core/mock.go`)
- `MockCourseSvc` — `GetCourse()`, `EnrollCourseForUser()`
- `MockIdentitySvc` — `GetUser()`, `GetUsers()`

### Missing Mocks (Need To Add)
- `TransactionRepo` — not in mockery config
- `PaymentGateway` — not in mockery config

## Existing Tests

**None.** No `*_test.go` files exist.

## Test Priority

| Priority | Target | Type | Why |
|----------|--------|------|-----|
| P0 | `TransactionSvc.CheckoutCourse` | Unit | Core business logic, orchestrates 3 interfaces |
| P0 | `TransactionSvc.ProcessVnpayIPN` | Unit | Complex branching (6+ paths) |
| P1 | `Vnpay.CreatePaymentURL` | Unit | HMAC signing, URL building, timezone |
| P1 | `Vnpay.VerifyIPN` | Unit | HMAC verification, TMN code check |
| P1 | `Course.GetCourse` | Unit | gRPC call, error mapping |
| P1 | `Course.EnrollCourseForUser` | Unit | gRPC call, error mapping |
| P1 | `errs` package | Unit | Error construction, interface compliance |
| P2 | `StrictHandler.CheckoutCourse` | Unit | Request parsing, user extraction, response |
| P2 | `StrictHandler.VnpayIpn` | Unit | Query param parsing, response building |
| P2 | `TransactionRepo` | Unit | GORM queries, domain conversion |
| P3 | Config, Server, Health | Unit | Lifecycle, config validation |
