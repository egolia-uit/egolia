# Unit Test Plan: `internal/course/`

## Architecture

The `course` project follows clean architecture (DDD, CQRS):
- `internal/course/domain/` — domain models, repo interfaces, domain services, UnitOfWork
- `internal/course/app/` — command handlers (commands) + query handlers (queries)

## Prerequisites

### 1. Mockery Config Update — `cmd/course/.mockery.yaml`

**Current app regex**: `^(ObjectStorageSvc|IdentityService)$`

`IdentityService` has a code comment "Is this being used anywhere? If not, delete it" — confirmed unused. Remove it.

**Change** — replace app regex with explicit read model interfaces:

```yaml
  github.com/egolia-uit/egolia/internal/course/app:
    config:
      include-interface-regex: '^(ObjectStorageSvc|GetCourseReadModel|GetCourseDetailReadModel|GetLessonDetailReadModel|GetCoursesReadModel|GetCourseReviewsReadModel|GetMyCertificatesReadModel|GetLessonCommentsReadModel|GetCourseProgressReadModel|GetLessonProgressReadModel)$'
```

Run: `pnpm nx gen:mockery course`

### 2. Test Helper — `app/helper_test.go`

**Purpose**: Shared test infrastructure for all app-layer tests.

Contains:
- **`mockUow`** — custom implementation of `domain.UnitOfWork`. Instead of mockery boilerplate, this directly calls `fn(repoRegistry)` so we test handler logic, not UoW infrastructure.
- **`mockRepoRegistry`** — typed fields for all 8 domain mock repos (MockCourseRepo, MockBookmarkRepo, MockEnrollmentRepo, MockLessonCommentRepo, MockLessonProgressRepo, MockReviewRepo, MockCertificateRepo, MockCourseProgressRepo). Each getter returns the corresponding mock.
- **`withUow(t)`** — convenience constructor returning `(*mockUow, *mockRepoRegistry)`
- **Domain builder helpers** — `newCourse()`, `newApprovedCourse()`, `newDraftCourse()`, `newEnrollment()`, `newVideoLesson()`, `newTestLesson()`, `randomUUID()`, `ctx = context.Background()`

## Testing Standards

| Practice | Rule |
|----------|------|
| Framework | `testify` + `testify/suite` |
| Package | `{packageName}_test` suffix (e.g., `domain_test`) |
| Parallelism | `t.Parallel()` on every test function unless shared state requires `testify/suite` |
| Table-driven | All tests use table-driven patterns |
| Mockery | All mocked interfaces generated via mockery, never hand-written |
| Skip stubs | `MoveLessonSvc` is a TODO stub — do not test |
| Run | `pnpm nx test course` + `pnpm nx lint course` |

---

## A. Domain Service Tests

All files in `internal/course/domain/`. All use `t.Parallel()`, table-driven, existing mockery mocks.

| File | Service | Test Cases (table rows) |
|------|---------|------------------------|
| `authorizationsvc_test.go` | AuthorizationSvc | **HasGetCourseDetailPermission**: admin→true, instructor→true, enrolled→true, unenrolled on approved→false, unenrolled on hidden→false, repo error. **HasHideCoursePermission**: admin→true, instructor→true, other instructor→false, learner→false |
| `deletecoursesvc_test.go` | DeleteCourseSvc | no enrollments→course deleted, has enrollments→error, nil EnrollmentRepo→error |
| `enrollincoursesvc_test.go` | EnrollInCourseSvc | new→created, already enrolled→error, empty learnerID→error |
| `finishcoursesvc_test.go` | FinishCourseSvc | same learner→completed, different learner→error, nil enrollment→error |
| `reviewpolicy_test.go` | ReviewPolicySvc | enrolled & not reviewed→ok, not enrolled→error, already reviewed→error |
| `movelessonsvc_test.go` | **SKIP** | Stub (`// TODO`, empty body) |

---

## B. App Command Handler Tests

All files in `internal/course/app/`. All use `t.Parallel()`, `withUow()` helper, table-driven.

### `cmd_crudcourse_test.go` — 4 handlers

| Handler | Test Cases |
|---------|-----------|
| `CreateCourseHandler` | valid→saves via CourseRepo.Save; invalid title (empty)→error |
| `UpdateCourseHandler` | update all fields→success; course not found→error; invalid price→error |
| `DeleteCourseHandler` | no enrollments→deletes+saves; has enrollments→error propagates from DeleteCourseSvc; not found→error |
| `ApproveCourseHandler` | original course (no draft)→approves; draft version→merges+approves original+deletes draft+saves both; merge error→propagated |

### `cmd_section_test.go` — 2 handlers

| Handler | Test Cases |
|---------|-----------|
| `CreateSectionHandler` | valid→adds section+saves; duplicate title→error; course not found→error; not editable→unauthorized |
| `UpdateSectionTitleHandler` | valid→updates title; title already exists→error; section not found→error |

### `cmd_lesson_test.go` — 6 handlers

| Handler | Test Cases |
|---------|-----------|
| `CreateVideoLessonHandler` | valid→adds lesson+saves; not instructor-editable→unauthorized |
| `CreateTestLessonHandler` | valid→adds test lesson+saves |
| `EditVideoLessonHandler` | update title→success; lesson not video→error; not instructor→error |
| `EditTestLessonHandler` | update questions→success; course not found→error |
| `DeleteLessonHandler` | valid→deletes lesson+saves; not editable→unauthorized |
| `DeleteSectionHandler` | valid→deletes section+saves; section not empty→error |

### `cmd_comment_test.go` — 3 handlers

| Handler | Test Cases |
|---------|-----------|
| `CommentOnLessonHandler` | valid→saves comment |
| `ReplyOnLessonCommentHandler` | valid→saves reply; origin comment not found→error |
| `DeleteLessonCommentHandler` | valid→deletes replies+saves; not found→error |

### `cmd_enrollment_test.go` — 5 handlers

| Handler | Test Cases |
|---------|-----------|
| `EnrollInCourseHandler` | valid→saves enrollment; course not found→error; already enrolled→error |
| `FinishCourseHandler` | valid→completes+saves; enrollment not found→error |
| `MarkLessonAsCompletedHandler` | video with sufficient watch→completes; video insufficient→no-op; test lesson→completes; already completed→no-op |
| `SaveVideoLessonProgressHandler` | new→saves+calls MarkLessonAsCompleted; existing→updates+calls MarkLessonAsCompleted |
| `ResetLessonProgressHandler` | valid→resets |

### `cmd_review_test.go` — 3 handlers

| Handler | Test Cases |
|---------|-----------|
| `ReviewCourseHandler` | valid→saves review; not enrolled→error; already reviewed→error |
| `UpdateReviewHandler` | valid→updates+saves |
| `DeleteReviewHandler` | valid→deletes review |

### `cmd_misc_test.go` — 7 handlers

| Handler | Test Cases |
|---------|-----------|
| `BookmarkCourseHandler` | not bookmarked→creates; already→deletes (toggle); not published→error; not found→error |
| `HideCourseHandler` | has permission→toggles hidden+saves; no permission→unauthorized |
| `SubmitCourseHandler` | draft→status=pending; not draft→error |
| `DeclineCourseHandler` | pending→deletes+saves; not pending→error; not found→error |
| `CreateDraftVersionHandler` | valid→creates draft+saves; already has draft→error; draft-of-draft→error; wrong instructor→error |
| `MoveSectionHandler` | valid→moves+saves; not editable→unauthorized |
| `MoveLessonHandler` | valid→moves+saves; not editable→unauthorized |

**Note**: `MoveLessonHandler` does NOT use the stub `MoveLessonSvc` — it calls `course.MoveLesson()` directly. It is testable.

---

## C. App Query Handler Tests

All use `t.Parallel()` + mockery-generated read model mocks.

### `q_course_test.go` — 6 handlers

| Handler | Read Model | Test Cases |
|---------|-----------|------------|
| `GetCourseHandler` | GetCourseReadModel | found→returns; not found→error |
| `GetCourseDetailHandler` | GetCourseDetailReadModel + AuthorizationSvc | has permission→returns; no permission→unauthorized; auth error→propagated |
| `GetCourseForUpdateHandler` | GetCourseDetailReadModel | found→returns; nil→DraftCourseNotFound |
| `GetCourseLandingPageHandler` | GetCoursesReadModel | found→returns with hidden=false, status=approved |
| `GetPublishedCoursesHandler` | GetCoursesReadModel | returns filtered list |
| `GetSystemCoursesHandler` | GetCoursesReadModel | returns all |

### `q_userdata_test.go` — 5 handlers

| Handler | Read Model | Test Cases |
|---------|-----------|------------|
| `GetMyCoursesHandler` | GetCoursesReadModel | returns instructor's courses |
| `GetMyEnrolledCoursesHandler` | GetCoursesReadModel | returns enrolled (approved, hidden=false) |
| `GetMyBookmarkedCoursesHandler` | GetCoursesReadModel | returns bookmarked (approved, hidden=false) |
| `GetMyCertificatesHandler` | GetMyCertificatesReadModel | returns list |
| `GetCourseProgressHandler` | GetCourseProgressReadModel | returns progress |

### `q_lesson_test.go` — 3 handlers

| Handler | Read Model | Test Cases |
|---------|-----------|------------|
| `GetLessonDetailHandler` | GetLessonDetailReadModel | video found→video; video not found, test found→test; both not found→error |
| `GetLessonCommentsHandler` | GetLessonCommentsReadModel | returns comments |
| `GetLessonProgressHandler` | GetLessonProgressReadModel | returns progress |

### `q_review_test.go` — 1 handler

| Handler | Read Model | Test Cases |
|---------|-----------|------------|
| `GetCourseReviewsHandler` | GetCourseReviewsReadModel | returns paginated reviews |

### `q_upload_test.go` — 1 handler

| Handler | Read Model | Test Cases |
|---------|-----------|------------|
| `GetUploadVideoLessonURLHandler` | ObjectStorageSvc | returns upload URL; service error→propagated |

---

## D. Implementation Order

| Step | Action | Dependencies |
|------|--------|-------------|
| 1 | Update `cmd/course/.mockery.yaml` app config | None |
| 2 | Run `pnpm nx gen:mockery course` | Step 1 |
| 3 | Create `app/helper_test.go` with mockUow, mockRepoRegistry, builders | Step 2 |
| 4 | Write domain service tests (5 files) | Step 2 |
| 5 | Write app query handler tests (5 files) | Step 2, 3 |
| 6 | Write app command handler tests (7 files) | Step 2, 3 |
| 7 | `pnpm nx test course && pnpm nx lint course` | All above |

---

## E. All Files Summary

| File | What Tests | Parallel | Notes |
|------|-----------|----------|-------|
| `domain/authorizationsvc_test.go` | AuthorizationSvc (2 methods) | ✓ | Uses MockCourseRepo, MockEnrollmentRepo |
| `domain/deletecoursesvc_test.go` | DeleteCourseSvc.Handle | ✓ | Uses MockEnrollmentRepo |
| `domain/enrollincoursesvc_test.go` | EnrollInCourseSvc.Handle | ✓ | Uses MockEnrollmentRepo |
| `domain/finishcoursesvc_test.go` | FinishCourseSvc.Handle | ✓ | Pure logic |
| `domain/reviewpolicy_test.go` | ReviewPolicySvc.Handle | ✓ | Pure logic |
| `app/helper_test.go` | Test infrastructure | N/A | No tests, just helpers |
| `app/cmd_crudcourse_test.go` | Create, Update, Delete, Approve Course | ✓ | 4 handlers |
| `app/cmd_lesson_test.go` | Video/Test Lesson create/edit, delete lesson/section | ✓ | 6 handlers |
| `app/cmd_section_test.go` | Create Section, Update Section Title | ✓ | 2 handlers |
| `app/cmd_comment_test.go` | Comment, Reply, Delete Comment | ✓ | 3 handlers |
| `app/cmd_enrollment_test.go` | Enroll, Finish, MarkCompleted, SaveProgress, Reset | ✓ | 5 handlers |
| `app/cmd_review_test.go` | Review Course, Update, Delete | ✓ | 3 handlers |
| `app/cmd_misc_test.go` | Bookmark, Hide, Submit, Decline, Draft, MoveSection, MoveLesson | ✓ | 7 handlers |
| `app/q_course_test.go` | 6 course queries | ✓ | GetCourseDetail also mocks AuthSvc |
| `app/q_userdata_test.go` | 5 user-data queries | ✓ | |
| `app/q_lesson_test.go` | 3 lesson queries | ✓ | GetLessonDetail has video→test fallback |
| `app/q_review_test.go` | GetCourseReviews | ✓ | |
| `app/q_upload_test.go` | GetUploadVideoLessonURL | ✓ | Uses MockObjectStorageSvc |
| `domain/course_test.go` | (existing) CreateDraftVersion, Merge | ✓ | Keep as-is |
