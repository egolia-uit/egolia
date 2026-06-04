# Course Service — Project Overview

## General Information

| Field | Value |
|-------|-------|
| **Project** | Egolia Course Service |
| **Location** | `internal/course/` + `cmd/course/` |
| **Architecture** | Clean Architecture (DDD, CQRS) |
| **Language** | Go |
| **Build System** | Nx (`pnpm nx build course`) |
| **Database** | PostgreSQL (via GORM) |
| **Testing Status** | 🟡 Test plan written, implementation pending |

## Directory Structure

```
internal/course/
├── app/                      # Application layer (CQRS)
│   ├── commands/             # Command handler implementations
│   └── queries/              # Query handler implementations
├── component/
│   └── validator.go
├── config/
│   ├── config.go
│   ├── viper.go
│   └── wire.go
├── controller/
│   ├── http/                 # Gin HTTP handlers
│   │   └── handler.go
│   └── health/
│       └── health.go
├── domain/                   # Domain models & services
│   ├── authorizationsvc.go   # Authorization checks
│   ├── course.go             # Course aggregate
│   ├── deletecoursesvc.go    # Delete course rules
│   ├── enrollincoursesvc.go  # Enrollment rules
│   ├── finishcoursesvc.go    # Course completion rules
│   ├── movelessonsvc.go      # Lesson reordering (TODO stub)
│   ├── reviewpolicy.go       # Review policy rules
│   └── section.go            # Section entity
├── errs/                     # Custom error types
├── infra/                    # Infrastructure layer
│   ├── persistence/          # GORM implementations
│   └── service/              # External service clients
├── server.go
└── wire.go

cmd/course/
├── .mockery.yaml
├── Dockerfile
├── main.go
├── project.json
├── wire.go
└── wire_gen.go
```

## Test Plan Summary

| Test Category | Files | Methods/Handlers | Cases |
|---------------|-------|-----------------|-------|
| Domain Services | 5 | 6 | 23 |
| Core Command Handlers | 3 | 9 | 27 |
| Extended Command Handlers | 4 | 21 | 53 |
| Query Handlers | 5 | 16 | 35 |
| **Total** | **17** | **52** | **~138** |

## Architecture Patterns

### Clean Architecture
```
Controller → Application (CQRS) → Domain
     ↓             ↓                  ↓
   HTTP        Commands/Queries    Entities/Services
               UnitOfWork           Repository Interfaces
```

### CQRS Separation
- **Commands**: Mutations (create, update, delete, enroll, approve, etc.) — 30 handlers
- **Queries**: Read-only (get course, list courses, get progress, etc.) — 16 handlers
- Each command handler uses `UnitOfWork` for transactional consistency
- Each query handler uses Read Model interfaces for simple data access

### DDD Building Blocks
- **Aggregate Root**: `Course` with Sections and Lessons
- **Entities**: Course, Section, Lesson, Comment, Enrollment
- **Domain Services**: AuthorizationSvc, DeleteCourseSvc, EnrollInCourseSvc, FinishCourseSvc, ReviewPolicySvc
- **Value Objects**: CourseStatus, LessonType, etc.

## Domain Services

| Service | Method | Logic |
|---------|--------|-------|
| AuthorizationSvc | HasGetCourseDetailPermission | Role-based (admin→true, instructor of course→true, enrolled→true, unenrolled on hidden→false, unenrolled on approved→false) |
| AuthorizationSvc | HasHideCoursePermission | Role-based (admin→true, instructor→true, other instructor→false, learner→false) |
| DeleteCourseSvc | Handle | Prevents deletion if enrollments exist |
| EnrollInCourseSvc | Handle | Validates not already enrolled |
| FinishCourseSvc | Handle | Validates same learner owns enrollment |
| ReviewPolicySvc | Handle | Validates enrolled AND not already reviewed |

## Command Handlers (30 total)

### Core (9 handlers)
| Handler | Key Business Logic |
|---------|-------------------|
| CreateCourseHandler | Validation, status defaults |
| UpdateCourseHandler | Partial update, price validation |
| DeleteCourseHandler | Enrollment check |
| ApproveCourseHandler | Draft merging, status transition |
| CreateSectionHandler | Duplicate title check |
| UpdateSectionTitleHandler | Duplicate title validation |
| CommentOnLessonHandler | Content validation |
| ReplyOnLessonCommentHandler | Origin comment existence |
| DeleteLessonCommentHandler | Top-level vs reply deletion rules |

### Extended (21 handlers)
| Handler | Key Business Logic |
|---------|-------------------|
| CreateVideoLessonHandler | Authorization+section validation |
| CreateTestLessonHandler | Section existence check |
| EditVideoLessonHandler | Type checking, authorization |
| EditTestLessonHandler | Question validation |
| DeleteLessonHandler | Authorization check |
| DeleteSectionHandler | Authorization check (with lessons) |
| EnrollInCourseHandler | Already-enrolled check |
| FinishCourseHandler | Learner validation |
| MarkLessonAsCompletedHandler | Video≥80% rule, test auto-complete |
| SaveVideoLessonProgressHandler | Progress tracking threshold |
| ResetLessonProgressHandler | State management |
| ReviewCourseHandler | Enrollment + duplicate check |
| UpdateReviewHandler | Ownership + existence |
| DeleteReviewHandler | Ownership + existence |
| BookmarkCourseHandler | Toggle logic, published check |
| HideCourseHandler | Permission check |
| SubmitCourseHandler | Status transition validation |
| DeclineCourseHandler | Status transition validation |
| CreateDraftVersionHandler | Draft-exists check, instructor validation |
| MoveSectionHandler | Authorization, reorder logic |
| MoveLessonHandler | Authorization, reorder logic |

## Query Handlers (16 total)

| Handler | Read Model |
|---------|-----------|
| GetCourseHandler | GetCourseReadModel |
| GetCourseDetailHandler | GetCourseDetailReadModel + AuthorizationSvc |
| GetCourseForUpdateHandler | GetCourseDetailReadModel |
| GetCourseLandingPageHandler | GetCoursesReadModel (filtered) |
| GetPublishedCoursesHandler | GetCoursesReadModel |
| GetSystemCoursesHandler | GetCoursesReadModel (all) |
| GetMyCoursesHandler | GetCoursesReadModel (by instructor) |
| GetMyEnrolledCoursesHandler | GetCoursesReadModel (enrolled, public) |
| GetMyBookmarkedCoursesHandler | GetCoursesReadModel (bookmarked, public) |
| GetMyCertificatesHandler | GetMyCertificatesReadModel |
| GetCourseProgressHandler | GetCourseProgressReadModel |
| GetLessonDetailHandler | GetLessonDetailReadModel (video→test fallback) |
| GetLessonCommentsHandler | GetLessonCommentsReadModel |
| GetLessonProgressHandler | GetLessonProgressReadModel |
| GetCourseReviewsHandler | GetCourseReviewsReadModel |
| GetUploadVideoLessonURLHandler | ObjectStorageSvc |

## Mocking Status

Mockery config at `cmd/course/.mockery.yaml` — all required interfaces have mocks generated.

## Infrastructure Dependencies

- **PostgreSQL** — Main data store (GORM + migrations)
- **Object Storage** (S3-compatible) — Video lesson uploads
- **External Identity** — Authentik via Traefik JWT middleware (user info in headers)
- **gRPC** — Inter-service communication (billing ← course for enrollment)

## Existing Tests

**None currently implemented.** Mock infrastructure is in place, test plan is written with:
- `testify` + `testify/suite` for test framework
- `mockery` for interface mocking
- Table-driven test pattern
- `t.Parallel()` for concurrent execution
