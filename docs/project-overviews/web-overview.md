# Web Frontend — Project Overview

## General Information

| Field | Value |
|-------|-------|
| **Project** | Egolia Web Frontend |
| **Location** | `apps/web/` |
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript |
| **Build System** | Nx (`pnpm nx build web`) |
| **Package Manager** | pnpm (workspace) |
| **Testing Status** | ⚪ No tests, no test framework installed |

## Architecture

Next.js App Router application using React Server Components (RSC) for pages and Client Components for interactive features.

```
apps/web/src/
├── app/                  # Next.js App Router pages & API routes
│   ├── admin/            # Admin panel pages
│   ├── api/auth/         # BetterAuth API handler
│   ├── auth/             # Auth popup callbacks
│   ├── billing/          # Billing page
│   ├── blog/             # Blog pages
│   ├── courses/          # Public course marketplace
│   ├── dashboard/        # User dashboard
│   ├── instructor/       # Instructor course management
│   ├── learn/            # Learner workspace
│   └── login/            # Login page
├── components/           # Shared UI components
│   ├── hooks/            # Custom shared hooks
│   ├── layout/           # AppShell, AuthGate
│   ├── ui/               # UI component libraries
│   │   ├── neumorphism/  # Custom neumorphism-styled components (13)
│   │   └── shadcn/       # shadcn/ui components (21)
│   └── video-player/     # Plyr video player wrapper
├── features/             # Feature-based organization
│   ├── auth/             # BetterAuth + Authentik OAuth2
│   ├── billing/          # Learner & admin billing pages
│   ├── blog/             # Blog list/detail pages (mock data)
│   └── course/           # Full course feature (~12 component files)
└── lib/                  # Shared utilities
    ├── api/              # API client setup, interceptors, upload
    ├── auth/             # Auth client, token caching, roles, viewer
    └── env.ts            # Runtime environment configuration
```

## Pages & Routes

### Public Pages
| Route | Component | Type |
|-------|-----------|------|
| `/courses` | MarketplacePage | RSC wrapper |
| `/courses/[courseId]` | PublicCoursePage | Client |
| `/login` | LoginPage | RSC |
| `/blog` | BlogListPage | RSC wrapper |
| `/blog/[slug]` | BlogDetailPage | Client |

### Authenticated Pages
| Route | Component | Type |
|-------|-----------|------|
| `/learn` | LearnerHomePage | RSC wrapper |
| `/learn/courses/[courseId]` | LearnerCoursePage | Client |
| `/learn/courses/[courseId]/sections/[sectionId]/lessons/[lessonId]` | LearnerLessonPage | Client |
| `/instructor/courses` | InstructorCoursesPage | RSC wrapper |
| `/instructor/courses/[courseId]` | InstructorCourseDetailPage | Client |
| `/instructor/courses/[courseId]/builder` | InstructorCourseBuilderPage | Client |
| `/dashboard` | DashboardRedirectPage | RSC |
| `/billing` | LearnerBillingPage | RSC wrapper |
| `/admin/courses` | AdminCoursesPage | RSC wrapper |
| `/admin/billing` | AdminBillingPage | RSC wrapper |
| `/admin/blog` | AdminBlogPage | RSC wrapper |

### API Routes
| Route | Purpose |
|-------|---------|
| `/api/auth/[...all]` | BetterAuth API handler |
| `/runtime-env` | Runtime environment variables |
| `/vnpay/return` | VNPAY checkout return URL |

## Client Components (Business Logic)

### Course Feature (`src/features/course/components/`)
| File | Size | Complexity |
|------|------|------------|
| `course-marketplace.tsx` | ~603 lines | Medium — course catalog, search, hero, public course page with VNPAY checkout |
| `course-learner.tsx` | ~3000+ lines | High — learner workspace, progress tracking, quiz UI, comments/discussion |
| `course-instructor.tsx` | ~1295 lines | High — course CRUD, create dialog, video upload, course lifecycle |
| `course-admin.tsx` | ~541 lines | Medium — approve/decline/review workflows |
| `course-card.tsx` | ~650 lines | Medium — bookmark toggle, contextual actions, progress |
| `course-detail.tsx` | ~237 lines | Low — course hero, sections listing |
| `course-form.tsx` | ~365 lines | Medium — form validation, price parsing |
| `course-curriculum-editor.tsx` | ~2970 lines | High — full curriculum builder, drag support, video/test lesson editing |
| `course-shared.tsx` | ~549 lines | Medium — shared hooks, VideoDropZone, CourseReviewsPanel |
| `course-states.tsx` | ~151 lines | Low — skeleton, empty, error states |
| `course-video-player.tsx` | ~157 lines | Low — Plyr video player wrapper |

### Auth Feature (`src/features/auth/`)
| File | Purpose |
|------|---------|
| `auth/server/index.ts` | BetterAuth server config with Authentik OAuth2 |
| `auth/components/index.tsx` | SignInButton, SignUpButton, SignOutButton |
| `auth/popup.ts` | Popup auth window helpers |
| `auth/queries/index.ts` | Server-side getSession() |

### Billing Feature (`src/features/billing/`)
| File | Purpose |
|------|---------|
| `billing/components/billing-pages.tsx` | LearnerBillingPage (API-backed), AdminBillingPage (mock stats) |

### Blog Feature (`src/features/blog/`)
| File | Purpose |
|------|---------|
| `blog/components/blog-pages.tsx` | BlogListPage, BlogDetailPage, AdminBlogPage (all mock data) |

## Pure Functions (Highly Testable)

### `src/lib/auth/roles.ts`
- `parseTokenPayload(token)` — Decode JWT payload, extract roles/entitlements
- `normalizeRoles(rawRoles)` — Normalize role string to array
- `hasRole(viewer, role)` — Check if viewer has specific role
- `primaryRole(roles)` — Determine primary role (admin > instructor > learner)
- `routeForViewer(viewer)` — Get redirect route based on viewer role
- `getViewer()` — Fetch session + access token, build Viewer object

### `src/lib/api/errors.ts`
- `normalizeApiError(error)` — Normalize API error into `ApiProblem` type

### `src/lib/api/format.ts`
- `formatVnd(amount)` — Format currency as VND
- `formatDateTime(date)` — Format date string
- `formatDuration(seconds)` — Format duration as human-readable

### `src/lib/api/index.ts`
- `resolveVideoUrl(url)` — Normalize video URL
- Request/response interceptors

### `src/lib/auth/access-token.ts`
- Token caching logic (10s TTL)
- Retry behavior

## API Dependencies

```typescript
// All SDK functions from packages/api-gen/src/sdk.gen.ts
// Generated by @hey-api/openapi-ts from OpenAPI spec
// React Query hooks in packages/api-gen/src/@tanstack/
```

Key SDK calls used across components:
- Course CRUD: `getPublishedCourses`, `getCourseDetail`, `getCourseForUpdate`, `createCourse`, `updateCourse`, `deleteCourse`
- Enrollment/Progress: `enrollCourse`, `finishCourse`, `markLessonCompleted`, `saveVideoLessonProgress`
- Reviews: `reviewCourse`, `updateReview`, `deleteReview`, `getCourseReviews`
- Bookmarks: `bookmarkCourse`, `unbookmarkCourse`, `getMyBookmarkedCourses`
- Course Lifecycle: `approveCourse`, `declineCourse`, `submitCourse`, `hideCourse`, `createDraftVersion`
- Curriculum: `createLesson`, `editVideoLesson`, `deleteLesson`, `moveLesson`, `moveSection`
- Payment: `checkoutCourse`, `getTransactions`

## Existing Tests

**None.** Zero test files. No testing framework installed or configured.

## Testing Recommendations

### High Priority — Pure Functions (Unit Tests)
1. `roles.ts` — `parseTokenPayload`, `normalizeRoles`, `hasRole`, `primaryRole`, `routeForViewer`, `getViewer`
2. `errors.ts` — `normalizeApiError`
3. `format.ts` — `formatVnd`, `formatDateTime`, `formatDuration`
4. `access-token.ts` — token caching, retry logic
5. `popup.ts` — `waitForAuthPopup`, `openCenteredPopup`

### Medium Priority — Component Logic (Unit + Component Tests)
1. `course-form.tsx` — Validation logic, price conversion
2. `course-card.tsx` — Bookmark toggle logic, status label computation
3. `course-shared.tsx` — Custom hooks (`useCourseList`, `useCourseDetail`, `useCourseReviews`)
4. `course-states.tsx` — Rendering edge cases
5. `billing-pages.tsx` — Transaction display logic

### Lower Priority — Integration Tests
1. `course-learner.tsx` — Complex UI with quiz, progress, comments
2. `course-curriculum-editor.tsx` — Drag-and-drop curriculum editing
3. `course-marketplace.tsx` — Search, filter, payment flow
4. `app-shell.tsx` — Navigation generation, role-based menus
5. `auth-gate.tsx` — Role-based access control

### Stack Recommendation
- **Vitest** (fast, native ESM, works with Next.js)
- **@testing-library/react** (component testing)
- **@testing-library/jest-dom** (DOM matchers)
- **msw** (API mocking for integration tests)
- **@vitejs/plugin-react** (JSX transform)
