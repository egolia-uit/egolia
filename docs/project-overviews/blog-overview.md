# Blog Service — Project Overview

## General Information

| Field | Value |
|-------|-------|
| **Project** | Egolia Blog Service |
| **Location** | `internal/blog/` + `cmd/blog/` |
| **Architecture** | Layered (not DDD/CQRS) |
| **Language** | Go |
| **Build System** | Nx (`pnpm nx build blog`) |
| **Database** | PostgreSQL (via GORM) |
| **Testing Status** | ⚪ No tests, no business logic yet (skeleton) |

## Directory Structure

```
internal/blog/
├── component/
│   ├── validator.go          # go-playground/validator instance
│   └── wire.go               # ProviderSet
├── config/
│   ├── config.go             # Config, Server, Services structs + New()
│   ├── viper.go              # Viper configuration loading
│   └── wire.go               # ProviderSet
├── controller/
│   ├── wire.go               # ProviderSet -> health.ProviderSet
│   └── health/
│       ├── health.go         # Health check endpoints
│       └── wire.go           # ProviderSet
├── server.go                 # Server struct, Run method
└── wire.go                   # Top-level ProviderSet

cmd/blog/
├── .mockery.yaml             # Mockery configuration (targets non-existent core/)
├── Dockerfile
├── main.go                   # Entry point
├── metadata.go
├── project.json
├── test.sh                   # gotestsum test runner
├── wire.go                   # Wire DI assembly
└── wire_gen.go               # Generated wire code
```

## Current State: Skeleton

The blog service is **not yet implemented**. It currently only has:
- **Health endpoints**: `/blog/health/startup`, `/blog/health/ready`, `/blog/health/live`
- **Config loading**: Full Viper-based config with env vars (prefix `EGOLIA_BLOG_`)
- **Validator**: go-playground/validator setup
- **Server lifecycle**: Graceful shutdown via errgroup

**No `core/` directory exists.** The business logic layer, domain models, repository interfaces, and HTTP handlers have not been built yet.

## Defined API Endpoints (from OpenAPI Spec)

| Method | Path | Operation | Auth |
|--------|------|-----------|------|
| `GET` | `/blog/posts` | Search/Create posts | OAuth2 |
| `POST` | `/blog/posts` | Create post | OAuth2 |
| `GET` | `/blog/posts/{postId}` | Get post by ID | OAuth2 |
| `PUT` | `/blog/posts/{postId}` | Update post | OAuth2 |
| `DELETE` | `/blog/posts/{postId}` | Delete post | OAuth2 |
| `GET` | `/blog/posts/{postId}/comments` | Get post comments | OAuth2 |
| `POST` | `/blog/posts/{postId}/comments` | Comment on post | OAuth2 |
| `PUT` | `/blog/comments/{commentId}` | Update comment | OAuth2 |
| `DELETE` | `/blog/comments/{commentId}` | Delete comment | OAuth2 |
| `POST` | `/blog/comments/{commentId}/replies` | Reply to comment | OAuth2 |

### API Models (from `pkg/api/blog/`)

```go
type Post struct {
    Id           *uuid.UUID
    AuthorId     *string
    Title        string
    Content      string
    Tags         []string
    CreatedAt    *time.Time
    CommentCount *int
}

type Comment struct {
    Id              *uuid.UUID
    PostId          *uuid.UUID
    AuthorId        *string
    Content         string
    ParentCommentId *uuid.UUID   // nullable, for replies
    CreatedAt       *time.Time
}
```

## Config Structure

| Variable | Default | Description |
|----------|---------|-------------|
| `EGOLIA_BLOG_SERVER_HTTP_PORT` | `8083` | HTTP port |
| `EGOLIA_BLOG_SERVER_GRPC_PORT` | `18083` | gRPC port (defined but not in struct) |
| `EGOLIA_BLOG_SERVER_HEALTH_PORT` | `28083` | Health check port |
| `EGOLIA_BLOG_DATABASE_URL` | - | PostgreSQL connection string |
| `EGOLIA_BLOG_AUTHENTIK_HOST` | - | Authentik host |
| `EGOLIA_BLOG_AUTHENTIK_TOKEN` | - | Authentik API token |
| `EGOLIA_BLOG_SERVICES_COURSE_URL` | - | Course service gRPC URL |

## Mocking

- Mockery config exists at `cmd/blog/.mockery.yaml`
- Targets `internal/blog/core/` — **which does not exist yet**
- Regex `^()$` matches nothing — **no mocks would be generated**
- Project.json has `gen:mockery` target with proper configuration

## Existing Tests

**None.** No `*_test.go` files anywhere. Test runner (gotestsum) is configured but runs zero tests.

## What Needs To Be Built Before Testing

1. **`core/` package** — Post and Comment domain models
2. **Repository interfaces** — PostRepo, CommentRepo, UnitOfWork
3. **Handler implementation** — 10 HTTP handlers implementing StrictServerInterface
4. **Business logic** — Post CRUD, comment management, search
5. **Database migrations** — PostgreSQL schema
6. **Mock configuration** — Update `.mockery.yaml` to target actual interfaces

## Test Candidates (When Implemented)

| Layer | Priority | What to Test |
|-------|----------|--------------|
| Core models | P0 | Post/comment validation, business rules |
| Core services | P0 | Create/edit/delete post, comment CRUD, authorization |
| Repository | P1 | GORM queries, pagination, filtering |
| Controller | P2 | Request parsing, response building, error mapping |
| Config | P2 | Config loading, validation, defaults |
| Server | P3 | Server lifecycle, graceful shutdown |
