---
title: 'Test Plan'
subtitle: 'Egolia — Elearning on the Go'
date: 'June 1, 2026'
author:
  - name: 'Trần Nguyễn Thái Bình'
  - name: 'Nguyễn Thái Gia Nguyễn'
  - name: 'Phan Lê Minh'
  - name: 'Đặng Phú Thiện'
papersize: a4
mainfont: Liberation Serif
fontsize: 11pt
geometry:
  - top=0.5in
  - bottom=0.5in
  - left=0.5in
  - right=0.5in
toc: true
toc-depth: 3
lang: en
header-includes:
  - \usepackage{fancyhdr}
  - \pagestyle{fancy}
  - \fancyhead[L]{\small Egolia --- Unit Test Plan v1.0}
  - \fancyhead[R]{\small \thepage}
  - \fancyfoot[C]{}
  - \renewcommand{\headrulewidth}{0.4pt}
---

## 1.1 Document Change History

| Version | Date       | Contributor | Description                                      |
| ------- | ---------- | ----------- | ------------------------------------------------ |
| 1.0     | 04/06/2026 | Team        | Initial unit test plan creation (all 4 projects) |

## 1.2 Introduction

### 1.2.1 Purpose

This test plan defines the unit testing strategy, approach, resources, and schedule for the **entire Egolia application** — covering the Go backend services (`internal/course/`, `internal/billing/`, `internal/blog/`) and the Next.js frontend (`apps/web/`). Each project follows its own architectural pattern, and this plan tailors testing strategies accordingly.

### 1.2.2 Project Overview

|                |                              |
| -------------- | ---------------------------- |
| Project Name   | Egolia — Elearning on the Go |
| Duration       | Jan 1, 2026 — June 5, 2026   |
| Testing Period | May 30, 2026 — June 15, 2026 |
| Team Size      | 4 members                    |

| Project         | Location            | Architecture                      | Language   | Current State          | Test Files    |
| --------------- | ------------------- | --------------------------------- | ---------- | ---------------------- | ------------- |
| Course Service  | `internal/course/`  | Clean Architecture (DDD, CQRS)    | Go         | Full implementation    | 0 (plan: 17)  |
| Billing Service | `internal/billing/` | Layered (core + infra)            | Go         | Partial (2/4 handlers) | 0 (plan: ~15) |
| Blog Service    | `internal/blog/`    | Layered (skeleton)                | Go         | Skeleton (health only) | 0 (plan: ~8)  |
| Web Frontend    | `apps/web/`         | Next.js App Router (RSC + Client) | TypeScript | Full implementation    | 0 (plan: ~15) |

### 1.2.3 Objectives

| #   | Objective                                                                              |
| --- | -------------------------------------------------------------------------------------- |
| 1   | Validate critical course domain logic (5 domain services, 138 cases)                   |
| 2   | Validate billing business logic — checkout + VNPay IPN processing (2 core services)    |
| 3   | Establish blog service test foundation (config, health, and future business logic)     |
| 4   | Validate frontend pure functions (auth, formatting, API utilities) and component logic |
| 5   | Achieve >60% business logic coverage (Go), >50% module-level coverage (TypeScript)     |
| 6   | Establish CI/CD testing pipelines for all 4 projects                                   |

## 1.3 Architecture

### 1.3.1 Course Service — Clean Architecture (DDD, CQRS)

```
internal/course/
+-- domain/              # Domain models, repo interfaces, domain services, UnitOfWork
|   +-- authorizationsvc.go
|   +-- deletecoursesvc.go
|   +-- enrollincoursesvc.go
|   +-- finishcoursesvc.go
|   +-- reviewpolicy.go
|   \-- movelessonsvc.go  (TODO stub -- skip)
\-- app/                 # Command handlers (commands) + Query handlers (queries)
    +-- cmd_crudcourse.go  |  cmd_section.go  |  cmd_lesson.go
    +-- cmd_comment.go     |  cmd_enrollment.go |  cmd_review.go
    +-- cmd_misc.go
    +-- q_course.go        |  q_userdata.go  |  q_lesson.go
    \-- q_review.go        |  q_upload.go
```

### 1.3.2 Billing Service — Layered Architecture

```
internal/billing/
+-- core/             # Domain models + TransactionSvc (orchestrates logic)
+-- controller/http/  # Gin HTTP handlers (CheckoutCourse, VnpayIpn)
+-- infra/            # GORM persistence, VNPay, gRPC course client, Authentik
\-- errs/             # Custom error types & HTTP mapping
```

### 1.3.3 Blog Service — Layered Architecture (Skeleton)

```
internal/blog/
+-- controller/health/  # Health check endpoints only
+-- config/             # Viper-based configuration
\-- core/               # (Not yet implemented -- future Post/Comment models)
```

### 1.3.4 Web Frontend — Next.js App Router

```
apps/web/src/
+-- lib/              # Pure utility functions (roles, format, API, auth tokens)
|   +-- auth/roles.ts
|   +-- api/errors.ts | format.ts
|   \-- api/index.ts  (interceptors)
+-- features/         # Feature-based client components
|   +-- auth/         # Sign-in/out, popup helpers
|   +-- course/       # ~12 complex components (marketplace, learner, instructor, admin)
|   +-- billing/      # Billing management pages
|   \-- blog/         # Blog pages (currently mock data)
\-- components/       # Shared UI (shadcn/ui + neumorphism)
```

## 1.4 Testing Standards

### 1.4.1 Go Standards

| Practice       | Rule                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| Framework      | `testing` + `testify` + `testify/suite`                                     |
| Package naming | `{packageName}_test` suffix (e.g., `domain_test`)                           |
| Parallelism    | `t.Parallel()` on every test function (unless `testify/suite` shared state) |
| Pattern        | All tests use table-driven patterns                                         |
| Mocking        | Mocked interfaces generated via `mockery`, never hand-written               |
| Skip stubs     | `MoveLessonSvc` is a TODO stub — do not test                                |
| Run command    | `pnpm nx test {projectName}` + `pnpm nx lint {projectName}`                 |

### 1.4.2 TypeScript / Next.js Standards

| Practice        | Rule                                                                  |
| --------------- | --------------------------------------------------------------------- |
| Framework       | Vitest + @testing-library/react                                       |
| Component tests | `@testing-library/react` with `describe`/`it` blocks                  |
| Pure functions  | Direct import + test without mocking                                  |
| API mocking     | `msw` (Mock Service Worker) for API call interception                 |
| Mocking         | `vi.mock()` for module-level mocking (auth, navigation)               |
| Hook tests      | `renderHook` from `@testing-library/react`                            |
| Pattern         | Table-driven tests for pure functions, `describe`/`it` for components |
| Run command     | `pnpm nx test web` + `pnpm nx lint web` (to be configured)            |

## 1.5 Test Scope

### 1.5.1 In Scope

| Project | Layer             | Type | Approach  | Scope Summary                                                   |
| ------- | ----------------- | ---- | --------- | --------------------------------------------------------------- |
| Course  | Domain Services   | Unit | White-box | 5 services, 23 cases                                            |
| Course  | Command Handlers  | Unit | White-box | 30 handlers, 80 cases                                           |
| Course  | Query Handlers    | Unit | White-box | 16 handlers, 35 cases                                           |
| Billing | Core Services     | Unit | White-box | TransactionSvc (2 methods), error types                         |
| Billing | Infra Components  | Unit | Gray-box  | VNPay (2 methods), Course gRPC client, TransactionRepo          |
| Billing | Controller        | Unit | Gray-box  | HTTP handlers (CheckoutCourse, VnpayIpn), error mapping         |
| Blog    | Config            | Unit | White-box | Config loading, validation, defaults                            |
| Blog    | Health Controller | Unit | White-box | Health checker startup/ready/live                               |
| Blog    | Server Lifecycle  | Unit | White-box | Server Run, graceful shutdown                                   |
| Web     | Pure Functions    | Unit | White-box | roles.ts, errors.ts, format.ts, access-token.ts, popup.ts       |
| Web     | Component Logic   | Unit | Gray-box  | useViewer hook, form validation, bookmark toggle, status labels |
| Web     | Auth Components   | Unit | Gray-box  | AuthGate rendering, role-based redirect                         |

### 1.5.2 Out of Scope

| Item                       | Reason                                                         |
| -------------------------- | -------------------------------------------------------------- |
| Integration / E2E tests    | Separate scope (not yet planned)                               |
| Performance / Load tests   | Separate scope (not yet planned)                               |
| Visual regression tests    | Separate scope (not yet planned)                               |
| Blog business logic        | Core layer not yet implemented (future scope)                  |
| Billing unimplemented APIs | GetTransactions, GetPlatformRevenueAnalytics (not implemented) |
| `MoveLessonSvc`            | Stub (TODO, empty body)                                        |

## 1.6 Course Service — Domain Service Tests

All files in `internal/course/domain/`. All use `t.Parallel()`, table-driven, mockery-generated mocks.

| File                        | Service/Method                                | Test Cases | Row Detail                                                                                                       |
| --------------------------- | --------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `authorizationsvc_test.go`  | AuthorizationSvc.HasGetCourseDetailPermission | 6          | admin→true, instructor→true, enrolled→true, unenrolled on approved→false, unenrolled on hidden→false, repo error |
| `authorizationsvc_test.go`  | AuthorizationSvc.HasHideCoursePermission      | 5          | admin→true, instructor→true, other instructor→false, learner→false, repo error                                   |
| `deletecoursesvc_test.go`   | DeleteCourseSvc.Handle                        | 3          | no enrollments→deleted, has enrollments→error, nil EnrollmentRepo→error                                          |
| `enrollincoursesvc_test.go` | EnrollInCourseSvc.Handle                      | 3          | new→created, already enrolled→error, empty learnerID→error                                                       |
| `finishcoursesvc_test.go`   | FinishCourseSvc.Handle                        | 3          | same learner→completed, different learner→error, nil enrollment→error                                            |
| `reviewpolicy_test.go`      | ReviewPolicySvc.Handle                        | 3          | enrolled & not reviewed→ok, not enrolled→error, already reviewed→error                                           |
| `movelessonsvc_test.go`     | MoveLessonSvc.Handle                          | **SKIP**   | Stub (`// TODO`, empty body)                                                                                     |

**Total: 6 methods, 23 test cases.**

## 1.7 Course Service — Command Handler Tests

All files in `internal/course/app/`. Use `t.Parallel()`, `withUow()` helper, table-driven.

### 1.7.1 Core Command Handlers

| Handler                     | File                     | Test Cases | Detail                                                                       |
| --------------------------- | ------------------------ | ---------- | ---------------------------------------------------------------------------- |
| CreateCourseHandler         | `cmd_crudcourse_test.go` | 3          | valid→saves; empty title→error; negative price→error                         |
| UpdateCourseHandler         | `cmd_crudcourse_test.go` | 3          | update all fields→success; not found→error; invalid price→error              |
| DeleteCourseHandler         | `cmd_crudcourse_test.go` | 3          | no enrollments→deletes; has enrollments→error; not found→error               |
| ApproveCourseHandler        | `cmd_crudcourse_test.go` | 3          | original→approves; draft→merges+approves; merge error→propagated             |
| CreateSectionHandler        | `cmd_section_test.go`    | 4          | valid→adds+saves; duplicate title→error; not found→error; unauthorized→error |
| UpdateSectionTitleHandler   | `cmd_section_test.go`    | 3          | valid→updates; title exists→error; not found→error                           |
| CommentOnLessonHandler      | `cmd_comment_test.go`    | 2          | valid→saves; empty content→error                                             |
| ReplyOnLessonCommentHandler | `cmd_comment_test.go`    | 2          | valid→saves; origin not found→error                                          |
| DeleteLessonCommentHandler  | `cmd_comment_test.go`    | 3          | top-level→deletes; not found→error; reply→error                              |

**Subtotal: 9 handlers, 27 test cases.**

### 1.7.2 Extended Command Handlers

| Handler                        | File                     | Test Cases | Detail                                                                             |
| ------------------------------ | ------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| CreateVideoLessonHandler       | `cmd_lesson_test.go`     | 3          | valid→adds+saves; unauthorized→error; section not found→error                      |
| CreateTestLessonHandler        | `cmd_lesson_test.go`     | 2          | valid→adds+saves; not found→error                                                  |
| EditVideoLessonHandler         | `cmd_lesson_test.go`     | 3          | update title→success; wrong type→error; not instructor→error                       |
| EditTestLessonHandler          | `cmd_lesson_test.go`     | 2          | update questions→success; not found→error                                          |
| DeleteLessonHandler            | `cmd_lesson_test.go`     | 3          | valid→deletes; unauthorized→error; not found→error                                 |
| DeleteSectionHandler           | `cmd_lesson_test.go`     | 2          | valid→deletes; unauthorized→error                                                  |
| EnrollInCourseHandler          | `cmd_enrollment_test.go` | 3          | valid→saves; not found→error; already enrolled→error                               |
| FinishCourseHandler            | `cmd_enrollment_test.go` | 3          | valid→completes; not found→error; wrong learner→error                              |
| MarkLessonAsCompletedHandler   | `cmd_enrollment_test.go` | 4          | video≥80%→completes; video<80%→no-op; test→completes; already→no-op                |
| SaveVideoLessonProgressHandler | `cmd_enrollment_test.go` | 2          | new→saves+completes; existing→updates+completes                                    |
| ResetLessonProgressHandler     | `cmd_enrollment_test.go` | 2          | exists→resets; not found→no-op                                                     |
| ReviewCourseHandler            | `cmd_review_test.go`     | 3          | valid→saves; not enrolled→error; already reviewed→error                            |
| UpdateReviewHandler            | `cmd_review_test.go`     | 2          | valid→updates+saves; not found→error                                               |
| DeleteReviewHandler            | `cmd_review_test.go`     | 2          | valid→deletes; not found→error                                                     |
| BookmarkCourseHandler          | `cmd_misc_test.go`       | 4          | not bookmarked→creates; already→deletes; not published→error; not found→error      |
| HideCourseHandler              | `cmd_misc_test.go`       | 2          | has permission→toggles+saves; unauthorized→error                                   |
| SubmitCourseHandler            | `cmd_misc_test.go`       | 2          | draft→pending; not draft→error                                                     |
| DeclineCourseHandler           | `cmd_misc_test.go`       | 3          | pending→deletes; not pending→error; not found→error                                |
| CreateDraftVersionHandler      | `cmd_misc_test.go`       | 4          | valid→creates+saves; has draft→error; draft-of-draft→error; wrong instructor→error |
| MoveSectionHandler             | `cmd_misc_test.go`       | 2          | valid→moves+saves; unauthorized→error                                              |
| MoveLessonHandler              | `cmd_misc_test.go`       | 2          | valid→moves+saves; unauthorized→error (NOT using stub)                             |

**Subtotal: 21 handlers, 53 test cases.**

## 1.8 Course Service — Query Handler Tests

All in `internal/course/app/`. Use `t.Parallel()` + mockery-generated read model mocks.

### 1.8.1 Course Queries

| Handler                     | Read Model                                  | Test Cases | Detail                                                            |
| --------------------------- | ------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| GetCourseHandler            | GetCourseReadModel                          | 2          | found→returns; not found→error                                    |
| GetCourseDetailHandler      | GetCourseDetailReadModel + AuthorizationSvc | 3          | has permission→returns; unauthorized→error; auth error→propagated |
| GetCourseForUpdateHandler   | GetCourseDetailReadModel                    | 2          | found→returns; nil→DraftCourseNotFound                            |
| GetCourseLandingPageHandler | GetCoursesReadModel                         | 2          | found (hidden=false, approved)→returns; error→propagated          |
| GetPublishedCoursesHandler  | GetCoursesReadModel                         | 2          | returns list; returns empty                                       |
| GetSystemCoursesHandler     | GetCoursesReadModel                         | 2          | returns all; returns empty                                        |

### 1.8.2 User Data Queries

| Handler                       | Read Model                 | Test Cases | Detail                                             |
| ----------------------------- | -------------------------- | ---------- | -------------------------------------------------- |
| GetMyCoursesHandler           | GetCoursesReadModel        | 2          | returns instructor's courses; empty                |
| GetMyEnrolledCoursesHandler   | GetCoursesReadModel        | 2          | returns enrolled (approved, hidden=false); empty   |
| GetMyBookmarkedCoursesHandler | GetCoursesReadModel        | 2          | returns bookmarked (approved, hidden=false); empty |
| GetMyCertificatesHandler      | GetMyCertificatesReadModel | 2          | returns list; empty                                |
| GetCourseProgressHandler      | GetCourseProgressReadModel | 2          | returns progress; empty/zero                       |

### 1.8.3 Lesson Queries

| Handler                  | Read Model                 | Test Cases | Detail                                                        |
| ------------------------ | -------------------------- | ---------- | ------------------------------------------------------------- |
| GetLessonDetailHandler   | GetLessonDetailReadModel   | 3          | video found→video; video not found→test; both not found→error |
| GetLessonCommentsHandler | GetLessonCommentsReadModel | 2          | returns comments; empty slice                                 |
| GetLessonProgressHandler | GetLessonProgressReadModel | 2          | returns progress; empty/not started                           |

### 1.8.4 Other Queries

| Handler                        | File               | Read Model                | Cases | Detail                                       |
| ------------------------------ | ------------------ | ------------------------- | ----- | -------------------------------------------- |
| GetCourseReviewsHandler        | `q_review_test.go` | GetCourseReviewsReadModel | 2     | returns paginated reviews; empty             |
| GetUploadVideoLessonURLHandler | `q_upload_test.go` | ObjectStorageSvc          | 3     | returns URL; service error; validation error |

**Total: 16 handlers, 35 test cases.**

### 1.8.5 Course Service Summary

| Test Category             | Files  | Methods/Handlers | Test Cases |
| ------------------------- | ------ | ---------------- | ---------- |
| Domain Services           | 5      | 6                | 23         |
| Core Command Handlers     | 3      | 9                | 27         |
| Extended Command Handlers | 4      | 21               | 53         |
| Query Handlers            | 5      | 16               | 35         |
| **Total**                 | **17** | **52**           | **138**    |

## 1.9 Billing Service — Tests

All files in `internal/billing/`. Table-driven with `t.Parallel()`.

### 1.9.1 Core Service Tests

| File                           | Test Target                        | Cases | Detail                                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/transaction_test.go`     | TransactionSvc.CheckoutCourse      | 6     | course found→returns URL; course not found→error; repo save error→error; ID generation error→error; payment URL error→error; identity enrichment                                                        |
| `core/transaction_test.go`     | TransactionSvc.ProcessVnpayIPN     | 8     | success→completed+enroll; sig invalid→error; tx not found→"Order not found"; amount mismatch→error; already completed→no-op; failed status→failed tx; repo save error→error; course enroll error→logged |
| `core/paymentgateway_test.go`  | PaymentGateway interface contract  | 1     | (interface contract test, uses mock)                                                                                                                                                                    |
| `core/transactionrepo_test.go` | TransactionRepo interface contract | 1     | (interface contract test, uses mock)                                                                                                                                                                    |

### 1.9.2 Infrastructure Tests

| File                           | Test Target                | Cases | Detail                                                                                 |
| ------------------------------ | -------------------------- | ----- | -------------------------------------------------------------------------------------- |
| `infra/payment/vnpay_test.go`  | Vnpay.CreatePaymentURL     | 4     | sandbox→returns sandbox URL; prod→returns prod URL; HMAC correct format; IPv6 handling |
| `infra/payment/vnpay_test.go`  | Vnpay.VerifyIPN            | 5     | valid sig→ok; invalid sig→error; TMN code mismatch→error; missing params→error         |
| `infra/service/course_test.go` | Course.GetCourse           | 3     | found→returns course; not found→maps error; grpc error→wraps                           |
| `infra/service/course_test.go` | Course.EnrollCourseForUser | 2     | success→nil; grpc error→maps                                                           |

### 1.9.3 Controller Tests

| File                              | Test Target                  | Cases | Detail                                                                          |
| --------------------------------- | ---------------------------- | ----- | ------------------------------------------------------------------------------- |
| `controller/http/billing_test.go` | StrictHandler.CheckoutCourse | 4     | valid request→201; unauthorized user→401; missing user→error; service error→500 |
| `controller/http/billing_test.go` | StrictHandler.VnpayIpn       | 3     | valid IPN→200; invalid signature→400; missing params→400                        |
| `controller/http/err_test.go`     | Error ↔ HTTP status mapping  | 6     | all error codes mapped to correct HTTP statuses                                 |

### 1.9.4 Error Tests

| File                  | Test Target              | Cases | Detail                                                                      |
| --------------------- | ------------------------ | ----- | --------------------------------------------------------------------------- |
| `errs/common_test.go` | Error interface contract | 5     | NewForbidden, NewInvalid, NewInternal, sentinel Unauthorized, Unimplemented |
| `errs/course_test.go` | Course-specific errors   | 3     | NewCourseSvcInternalErr, NewCourseNotFoundErr                               |

### 1.9.5 Billing Service Summary

| Layer       | Files | Test Functions | Test Cases |
| ----------- | ----- | -------------- | ---------- |
| Core        | 2     | 4              | 16         |
| Infra       | 2     | 4              | 14         |
| Controller  | 2     | 3              | 13         |
| Error types | 2     | 2              | 8          |
| **Total**   | **8** | **13**         | **51**     |

## 1.10 Blog Service — Tests

All files in `internal/blog/`. Configured with `testify`, `gotestsum`.

### 1.10.1 Config Tests

| File                    | Test Target      | Cases | Detail                                                                                     |
| ----------------------- | ---------------- | ----- | ------------------------------------------------------------------------------------------ |
| `config/config_test.go` | Config.New()     | 4     | valid config→no error; missing required→error; default values set; optional fields omitted |
| `config/config_test.go` | Config via Viper | 2     | env var overrides file; invalid env→error                                                  |

### 1.10.2 Health Controller Tests

| File                               | Test Target            | Cases | Detail                                                             |
| ---------------------------------- | ---------------------- | ----- | ------------------------------------------------------------------ |
| `controller/health/health_test.go` | Health startup checker | 2     | startup checker returns nil; startup with DB migration future test |
| `controller/health/health_test.go` | Health ready checker   | 3     | DB ping success; Authentik success; HTTP self-ping success         |
| `controller/health/health_test.go` | Health live checker    | 1     | always returns nil                                                 |

### 1.10.3 Server & Component Tests

| File                          | Test Target      | Cases | Detail                                                      |
| ----------------------------- | ---------------- | ----- | ----------------------------------------------------------- |
| `server_test.go`              | Server lifecycle | 2     | Run blocks until signal; Run returns error on early failure |
| `component/validator_test.go` | NewValidate      | 1     | creates validator without error                             |

### 1.10.4 Blog Service Summary

| Layer     | Files | Test Functions | Test Cases |
| --------- | ----- | -------------- | ---------- |
| Config    | 1     | 2              | 6          |
| Health    | 1     | 3              | 6          |
| Server    | 1     | 1              | 2          |
| Component | 1     | 1              | 1          |
| **Total** | **4** | **7**          | **15**     |

## 1.11 Web Frontend — Tests

TypeScript tests using Vitest + @testing-library/react (to be installed/configured).

### 1.11.1 Pure Function Tests

| File                                | Test Target           | Cases | Detail                                                                                                      |
| ----------------------------------- | --------------------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| `src/lib/auth/roles.test.ts`        | `parseTokenPayload()` | 4     | valid token→parsed; invalid JWT→empty; missing roles→empty; missing entitlements→empty                      |
| `src/lib/auth/roles.test.ts`        | `normalizeRoles()`    | 3     | string→array; array→unchanged; empty→[]                                                                     |
| `src/lib/auth/roles.test.ts`        | `hasRole()`           | 4     | admin has admin→true; learner has admin→false; empty roles→false; case insensitive                          |
| `src/lib/auth/roles.test.ts`        | `primaryRole()`       | 4     | admin > instructor > learner; empty→learner; single role→that role                                          |
| `src/lib/auth/roles.test.ts`        | `routeForViewer()`    | 4     | admin→/admin/courses; instructor→/instructor/courses; learner→/learn; unauthenticated→/login                |
| `src/lib/api/errors.test.ts`        | `normalizeApiError()` | 5     | HTTP error→ApiProblem; network error→fallback; validation error→detail; unknown error→generic; null→generic |
| `src/lib/api/format.test.ts`        | `formatVnd()`         | 3     | zero→0₫; positive→formatted; large number→formatted                                                         |
| `src/lib/api/format.test.ts`        | `formatDateTime()`    | 3     | ISO string→formatted; invalid→original; null→empty                                                          |
| `src/lib/api/format.test.ts`        | `formatDuration()`    | 4     | seconds→"Xm Ys"; zero→"0s"; large→"Hh Mm Ss"; fractional→rounded                                            |
| `src/lib/auth/access-token.test.ts` | Token caching         | 4     | cache hit returns cached; cache miss fetches; TTL expired refreshes; retry on failure                       |
| `src/features/auth/popup.test.ts`   | `waitForAuthPopup()`  | 3     | auth message→resolves; error message→rejects; timeout→rejects                                               |
| `src/features/auth/popup.test.ts`   | `openCenteredPopup()` | 3     | opens with correct dimensions; popup blocked→null; returns window reference                                 |

### 1.11.2 Hook Tests

| File                                                    | Test Target             | Cases | Detail                                                              |
| ------------------------------------------------------- | ----------------------- | ----- | ------------------------------------------------------------------- |
| `src/lib/auth/use-viewer.test.ts`                       | `useViewer()`           | 3     | authenticated→returns viewer; unauthenticated→null; loading state   |
| `src/features/course/components/course-shared.test.tsx` | `useCourseList()`       | 3     | success→returns courses; error→returns error state; loading→loading |
| `src/features/course/components/course-shared.test.tsx` | `useCourseDetail()`     | 2     | found→returns detail; not found→null                                |
| `src/features/course/components/course-card.test.tsx`   | `useCourseBookmarked()` | 3     | bookmarked→true; not bookmarked→false; toggle callback fires        |

### 1.11.3 Component Tests

| File                                                  | Test Target    | Cases | Detail                                                                                                                           |
| ----------------------------------------------------- | -------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/layout/auth-gate.test.tsx`            | `AuthGate`     | 4     | authenticated & authorized→renders children; unauthenticated→redirects to /login; no role→redirects; unauthorized role→redirects |
| `src/components/layout/app-shell.test.tsx`            | `AppShell`     | 3     | learner→sees learner nav; instructor→sees instructor nav; admin→sees admin nav                                                   |
| `src/features/auth/components/index.test.tsx`         | `SignInButton` | 2     | renders; onClick opens popup                                                                                                     |
| `src/features/course/components/course-form.test.tsx` | `CourseForm`   | 4     | valid→submits; empty title→validation error; negative price→error; long title→error                                              |
| `src/features/course/components/course-card.test.tsx` | `CourseCard`   | 3     | published→shows correctly; draft→shows draft badge; bookmarked→toggle visible                                                    |

### 1.11.4 Web Frontend Summary

| Category       | Files  | Test Functions | Test Cases |
| -------------- | ------ | -------------- | ---------- |
| Pure Functions | 5      | 12             | 44         |
| Hooks          | 3      | 3              | 9          |
| Components     | 4      | 4              | 13         |
| **Total**      | **12** | **19**         | **66**     |

## 1.12 Consolidated Summary

### 1.12.1 All Projects Summary

| Project         | Files  | Test Functions | Test Cases | State                    |
| --------------- | ------ | -------------- | ---------- | ------------------------ |
| Course Service  | 17     | 52             | 138        | Plan ready, to implement |
| Billing Service | 8      | 13             | 51         | New plan                 |
| Blog Service    | 4      | 7              | 15         | New plan                 |
| Web Frontend    | 12     | 19             | 66         | New plan                 |
| **Grand Total** | **41** | **91**         | **270**    |                          |

### 1.12.2 All Files Summary

#### Go Backend (Course, Billing, Blog)

| File                               | What Tests                                                      | Parallel | Project |
| ---------------------------------- | --------------------------------------------------------------- | -------- | ------- |
| `domain/authorizationsvc_test.go`  | AuthorizationSvc (2 methods)                                    | [x]      | course  |
| `domain/deletecoursesvc_test.go`   | DeleteCourseSvc.Handle                                          | [x]      | course  |
| `domain/enrollincoursesvc_test.go` | EnrollInCourseSvc.Handle                                        | [x]      | course  |
| `domain/finishcoursesvc_test.go`   | FinishCourseSvc.Handle                                          | [x]      | course  |
| `domain/reviewpolicy_test.go`      | ReviewPolicySvc.Handle                                          | [x]      | course  |
| `app/helper_test.go`               | Test infrastructure (mockUow, helpers)                          | N/A      | course  |
| `app/cmd_crudcourse_test.go`       | Create, Update, Delete, Approve Course                          | [x]      | course  |
| `app/cmd_section_test.go`          | Create Section, Update Section Title                            | [x]      | course  |
| `app/cmd_lesson_test.go`           | Video/Test Lesson CRUD, delete, move                            | [x]      | course  |
| `app/cmd_comment_test.go`          | Comment, Reply, Delete Comment                                  | [x]      | course  |
| `app/cmd_enrollment_test.go`       | Enroll, Finish, MarkCompleted, SaveProgress, Reset              | [x]      | course  |
| `app/cmd_review_test.go`           | Review Course, Update, Delete                                   | [x]      | course  |
| `app/cmd_misc_test.go`             | Bookmark, Hide, Submit, Decline, Draft, MoveSection, MoveLesson | [x]      | course  |
| `app/q_course_test.go`             | 6 course queries                                                | [x]      | course  |
| `app/q_userdata_test.go`           | 5 user-data queries                                             | [x]      | course  |
| `app/q_lesson_test.go`             | 3 lesson queries                                                | [x]      | course  |
| `app/q_review_test.go`             | GetCourseReviews                                                | [x]      | course  |
| `app/q_upload_test.go`             | GetUploadVideoLessonURL                                         | [x]      | course  |
| `core/transaction_test.go`         | TransactionSvc (CheckoutCourse, ProcessVnpayIPN)                | [x]      | billing |
| `infra/payment/vnpay_test.go`      | Vnpay.CreatePaymentURL, VerifyIPN                               | [x]      | billing |
| `infra/service/course_test.go`     | Course.GetCourse, EnrollCourseForUser                           | [x]      | billing |
| `controller/http/billing_test.go`  | StrictHandler.CheckoutCourse, VnpayIpn                          | [x]      | billing |
| `controller/http/err_test.go`      | Error ↔ HTTP status mapping                                     | [x]      | billing |
| `errs/common_test.go`              | Error interface contract                                        | [x]      | billing |
| `errs/course_test.go`              | Course-specific errors                                          | [x]      | billing |
| `config/config_test.go`            | Config.New, Viper loading                                       | [x]      | blog    |
| `controller/health/health_test.go` | Health startup/ready/live checkers                              | [x]      | blog    |
| `server_test.go`                   | Server lifecycle                                                | [x]      | blog    |
| `component/validator_test.go`      | NewValidate                                                     | [x]      | blog    |

#### Web Frontend

| File                                                    | What Tests                                                              | Project |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | ------- |
| `src/lib/auth/roles.test.ts`                            | parseTokenPayload, normalizeRoles, hasRole, primaryRole, routeForViewer | web     |
| `src/lib/api/errors.test.ts`                            | normalizeApiError                                                       | web     |
| `src/lib/api/format.test.ts`                            | formatVnd, formatDateTime, formatDuration                               | web     |
| `src/lib/auth/access-token.test.ts`                     | Token caching logic, retry behavior                                     | web     |
| `src/features/auth/popup.test.ts`                       | waitForAuthPopup, openCenteredPopup                                     | web     |
| `src/lib/auth/use-viewer.test.ts`                       | useViewer hook                                                          | web     |
| `src/features/course/components/course-shared.test.tsx` | useCourseList, useCourseDetail hooks                                    | web     |
| `src/features/course/components/course-card.test.tsx`   | useCourseBookmarked, CourseCard rendering                               | web     |
| `src/components/layout/auth-gate.test.tsx`              | AuthGate role-based access control                                      | web     |
| `src/components/layout/app-shell.test.tsx`              | AppShell navigation generation                                          | web     |
| `src/features/auth/components/index.test.tsx`           | SignInButton component                                                  | web     |
| `src/features/course/components/course-form.test.tsx`   | CourseForm validation                                                   | web     |

## 1.13 Implementation Order

### Phase A: Infrastructure Setup

| Step | Action                                                                   | Dependencies | Est. Effort |
| ---- | ------------------------------------------------------------------------ | ------------ | ----------- |
| A1   | Update `cmd/course/.mockery.yaml` app config                             | None         | 0.5 day     |
| A2   | Run `pnpm nx gen:mockery course`                                         | A1           | 0.5 day     |
| A3   | Update `cmd/billing/.mockery.yaml` (add TransactionRepo, PaymentGateway) | None         | 0.5 day     |
| A4   | Run `pnpm nx gen:mockery billing`                                        | A3           | 0.5 day     |
| A5   | Update `cmd/blog/.mockery.yaml` (fix regex to match actual interfaces)   | None         | 0.5 day     |
| A6   | Install Vitest + @testing-library + msw in `apps/web/`                   | None         | 1 day       |
| A7   | Configure Vitest in `apps/web/` (vitest.config.ts)                       | A6           | 0.5 day     |
| A8   | Add `pnpm nx test web` target in `apps/web/project.json`                 | A7           | 0.5 day     |

### Phase B: Test Implementation by Project

| Step | Action                                                    | Dependencies | Est. Effort |
| ---- | --------------------------------------------------------- | ------------ | ----------- |
| B1   | Course: Create `app/helper_test.go` + domain services     | A2           | 3 days      |
| B2   | Course: Write query handler tests (5 files)               | A2           | 4 days      |
| B3   | Course: Write command handler tests (7 files)             | A2           | 6 days      |
| B4   | Billing: Write errs tests                                 | A4           | 1 day       |
| B5   | Billing: Write core TransactionSvc tests                  | A4           | 2 days      |
| B6   | Billing: Write infra tests (payment, course client, repo) | A4           | 2 days      |
| B7   | Billing: Write controller tests                           | A4           | 1 day       |
| B8   | Blog: Write config tests                                  | A5           | 1 day       |
| B9   | Blog: Write health controller tests                       | A5           | 1 day       |
| B10  | Blog: Write server & component tests                      | A5           | 0.5 day     |
| B11  | Web: Write pure function tests (5 files)                  | A8           | 2 days      |
| B12  | Web: Write hook tests (3 files)                           | A8           | 1 day       |
| B13  | Web: Write component tests (4 files)                      | A8           | 2 days      |

### Phase C: Integration & Finalization

| Step | Action                                                       | Dependencies | Est. Effort |
| ---- | ------------------------------------------------------------ | ------------ | ----------- |
| C1   | Run all Go tests: `pnpm nx test course` + `billing` + `blog` | B1-B10       | 0.5 day     |
| C2   | Run all Web tests: `pnpm nx test web`                        | B11-B13      | 0.5 day     |
| C3   | Run all linters: `pnpm nx lint course billing blog web`      | C1-C2        | 0.5 day     |
| C4   | Coverage review, bug fixes, documentation                    | C3           | 1 day       |

## 1.14 Team & Responsibilities

| Team Member            | ID       | Role                  | Responsibilities                                                                       |
| ---------------------- | -------- | --------------------- | -------------------------------------------------------------------------------------- |
| Trần Nguyễn Thái Bình  | 23520161 | Project Owner, DevOps | Course domain services, CI/CD pipelines, test infrastructure, Go tooling               |
| Nguyễn Thái Gia Nguyễn | 23521049 | Backend Developer     | Course command/query handlers, Billing tests (core + infra + controller)               |
| Phan Lê Minh           | 23520952 | Frontend Developer    | Web pure function tests, hook tests, Vitest setup, component test scaffolding          |
| Đặng Phú Thiện         | 23521476 | Frontend Developer    | Web component tests (AuthGate, AppShell, CourseForm, CourseCard), integration patterns |

### Detailed Work Assignments

| Team Member            | Primary Projects            | Test Files                                                                                                                                 |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Trần Nguyễn Thái Bình  | Course (domain), DevOps     | domain/\*\_test.go (5 files), Course helper_test.go, Blog config/server tests, CI config                                                   |
| Nguyễn Thái Gia Nguyễn | Course (app), Billing       | app/cmd*\*\_test.go (7 files), app/q*\*\_test.go (5 files), billing tests (8 files)                                                        |
| Phan Lê Minh           | Web (pure functions, hooks) | lib/auth/roles.test.ts, lib/api/errors.test.ts, lib/api/format.test.ts, lib/auth/access-token.test.ts, auth/popup.test.ts, hooks (3 files) |
| Đặng Phú Thiện         | Web (components)            | AuthGate, AppShell, SignInButton, CourseForm, CourseCard, course-shared (4-5 files)                                                        |

## 1.15 Test Schedule

| Phase                     | Duration | Dates        | Activities                                                                   |
| ------------------------- | -------- | ------------ | ---------------------------------------------------------------------------- |
| **Phase 0: Discovery**    | 2 days   | May 28-29    | Codebase exploration, docs generation (project overviews for all 4 projects) |
| **Phase 1: Setup**        | 3 days   | May 30-Jun 1 | Mockery configs for all Go projects, Vitest install+config web, helper setup |
| **Phase 2: Course**       | 6 days   | Jun 2-7      | 17 test files, 138 cases (domain + app commands + app queries)               |
| **Phase 3: Billing**      | 4 days   | Jun 5-8      | 8 test files, 51 cases (core + infra + controller + errs)                    |
| **Phase 4: Blog**         | 2 days   | Jun 7-8      | 4 test files, 15 cases (config + health + server + component)                |
| **Phase 5: Web Frontend** | 4 days   | Jun 9-12     | 12 test files, 66 cases (pure functions + hooks + components)                |
| **Phase 6: Finalization** | 3 days   | Jun 13-15    | All-project test runs, coverage review, lint fixes, documentation            |

## 1.16 Tools & Technologies

| Category          | Tool                      | Purpose                   | Project(s)            |
| ----------------- | ------------------------- | ------------------------- | --------------------- |
| Unit Testing (Go) | Go testing                | Backend unit tests        | course, billing, blog |
| Assertions        | testify/assert            | Test assertions           | course, billing, blog |
| Test Organization | testify/suite             | Test suite organization   | course, billing, blog |
| Mocking (Go)      | mockery                   | Interface mock generation | course, billing, blog |
| Unit Testing (TS) | Vitest                    | Frontend unit tests       | web                   |
| Component Testing | @testing-library/react    | React component tests     | web                   |
| DOM Matchers      | @testing-library/jest-dom | DOM assertion matchers    | web                   |
| API Mocking       | msw                       | API call interception     | web                   |
| Module Mocking    | vi.mock()                 | Module-level mocking      | web                   |
| Code Coverage     | Go coverage + Vitest      | Coverage reporting        | all                   |
| CI/CD             | GitHub Actions            | CI pipeline               | all                   |
| Version Control   | Git + GitHub              | Source control & hosting  | all                   |
| Linting (Go)      | golangci-lint             | Go code quality           | course, billing, blog |
| Linting (JS/TS)   | ESLint + Prettier         | Frontend code quality     | web                   |

## 1.17 Risks & Mitigation

| Risk                                                              | Likelihood | Impact | Mitigation                                                                |
| ----------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- | ----------- | --------------- | ----------------------------------- |
| Blog core layer not implemented; tests may need refactoring       | Medium     | Low    | Write tests for existing code only; leave hooks for future business logic |
| Billing missing mockery config for TransactionRepo/PaymentGateway | High       | High   | Add `^(CourseSvc                                                          | IdentitySvc | TransactionRepo | PaymentGateway)$` to mockery config |
| Web frontend has no test framework installed                      | High       | High   | Phase 1 covers Vitest setup; use well-documented patterns                 |
| Browser-specific features (popup auth) hard to test               | Low        | Medium | Use vi.mock() for window.open; test logic rather than browser APIs        |
| Time constraints — 4 projects in 14 days of testing               | Medium     | High   | Prioritize P0/P1 tests; blog tests are lightweight (skeleton only)        |

## 1.18 Glossary

| Term               | Definition                                                                             |
| ------------------ | -------------------------------------------------------------------------------------- |
| CQRS               | Command Query Responsibility Segregation — separating read and write operations        |
| DDD                | Domain-Driven Design — software design approach focusing on domain model               |
| Unit Test          | Test that validates individual functions or components in isolation                    |
| White-box Testing  | Testing approach where internal implementation is known; tests based on code structure |
| Gray-box Testing   | Testing approach combining knowledge of internals with interface-level testing         |
| Table-Driven Test  | Test pattern using data tables to parameterize test cases                              |
| Mockery            | Go mock code generation tool for interfaces                                            |
| Vitest             | Vite-native unit test framework for TypeScript/JavaScript                              |
| msw                | Mock Service Worker — intercepts network requests in tests                             |
| Unit of Work (UoW) | Pattern for managing transactional consistency                                         |
| IPN                | Instant Payment Notification — callback from payment gateway                           |
| HMAC               | Hash-based Message Authentication Code — used by VNPay for request signing             |
| RSC                | React Server Component — renders on the server in Next.js                              |

## 1.19 Conclusion

This unit test plan provides a comprehensive testing strategy covering **all four Egolia projects**:

1. **Course Service** (138 cases) — The most mature project, with full DDD/CQRS architecture. Tests cover domain services, command handlers, and query handlers following the existing test plan structure.

2. **Billing Service** (51 cases) — Tests focus on the core TransactionSvc (checkout flow, VNPay IPN processing), infrastructure components (VNPay URL building, gRPC client), controller handlers, and error types.

3. **Blog Service** (15 cases) — Currently a skeleton; tests validate config loading, health endpoints, and server lifecycle. Ready for expansion when business logic is implemented.

4. **Web Frontend** (66 cases) — Tests cover pure functions (auth, formatting, error handling), React hooks, and key components (AuthGate, AppShell, CourseForm, CourseCard). Vitest + @testing-library/react + msw provide the testing infrastructure.

**Grand total: ~270 test cases across 41 test files**, covering both Go backend logic and TypeScript frontend components. The parallel scheduling allows course and billing/blog work to overlap, with web frontend tests starting after Go test infrastructure is stable.
