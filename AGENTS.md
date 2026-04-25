# Monorepo

- Manged with Nx
- Package manager: pnpm (use ./pnpm-workspace.yaml), go (single go.mod for all packages), mise, buf

## Structure

```
api/                            # OpenAPI spec
proto/                          # Protobuf definitions
apps/                           # JS/TS applications
  web/                          # NextJS (nx: web)
  api-web/                      # OpenAPI Spec rendered with Scalar React (nx: api-web)
packages/                       # JS packages
  api-gen/                      # Frontend API client codegen from OpenAPI spec, using heyapi/openapi-ts
docs/                           # Vitepress Documentation (class, sequence, architecture diagrams, database, etc.)
cmd/                            # Go services
  course/                       # Course service (nx: course)
  billing/                      # Billing service (nx: billing)
  blog/                         # Blog service (nx: blog)
internal/                       # Internal Go packages
  note/
  billing/
  blog/
pkg/                            # Go packages
  api                           # Code gen from oapi-codegen
  common                        # Including commonhttp, commonconfig
  helper
  logging
  metadata
  otel                          # OpenTelemetry setting
  pb
```

## Technologies

### PNPM

- Use `pnpm-workspace.yaml` with catalog as much as possible, and reference packages with `workspace:` protocol

### API

- Redocly to bundle and join yaml spec to json
- Scalar render joined spec, mock server
- openapi-generator generate NestJS server code
- heyapi/openapi-ts generate frontend API client code (typescript, react-query, nextjs)
- oapi-codegen generate Go server code (gin, strict server)
- API change should come from API spec in `api` and `proto`, run `nx gen api` and `nx gen proto` to generate code

### Frontend

- Use shadcn component as much as possible, install into `apps/web`
  - Example: `nx shadcn:add web button`
- Use Tailwind CSS, try to avoid writing custom css and color
- Anything relate to calling API should look into `packages/api-gen`
- Avoid static site generation if need to call API
- Use BetterAuth with Authentik

### Go

- Use GORM
- `course` project apply clean architecture, CQRS, DDD
  - Domain model, repository in `internal/note/domain`
  - Application handler, service interface in `internal/note/application`
  - With CQRS, commands return nothing else but error. The ID must be created in the controller layer
- `billing` and `blog` projects use layered architecture, domain model merged with ORM, return model directly to controller
- Use `google/wire` fork
  - Run `nx gen:wire {projectName}`, do not run `go generate`
  - Each package should expose `wire.go` with `wire.Set`, and outside aggregate them in `wire.go`
  - `cmd/{projectName}/wire.go` imports `internal/{projectName}/wire.go`
- Each services expose `/{projectName}/health/*` including `live`, `ready`. Should used for diagnose stuff relate to infra, and other services connection

### Infrastructure

- Compose file in `./deploy/compose/compose.yaml`, which include all services, databases,...
- Note that our service don't run inside container, but directly on host

#### Authentik

- Users/Client/Role list in `./deploy/compose/infrastructure/authentik-blueprints/users.yaml`
- Frontend App in `./deploy/compose/infrastructure/authentik-blueprints/app-web.yaml` (include JWKS, callback URL, etc.)
- When editting blueprint, authentik will reconcile itself

#### Traefik

- Traefik config in `./deploy/compose/infrastructure/traefik/`, which include static and dynamic config
- Dynamic including `agilezebra/jwt-middleware` for authenticate, authorize with role mapped from OIDC `roles` claim
- Traefik will mount host network into itself, so it can access other services with `localhost:{port}`
- General local dev domain is `egolia.localhost`:
  - Web: `web.egolia.localhost`
  - API: `api.egolia.localhost`, include `api-web` for root, and `course`, `billing`, `blog` for each service

## Nx

- Targets are defined in each project `project.json`
- Targets:
  - build
  - run: run in development mode, continuous for go
  - dev: run in development mode, continuous for nextjs
  - start for nextjs style
  - serve/preview: run the built
- Do not skip nx to run command directly for build, lint
- If nx hang, or got error cannot resolve any further, try to run `nx reset` to clear cache and stop nx process

## General Rules

- Temp file must be go into `./tmp/{projectName}`, avoid writing to `/tmp/` when things need to be persisted
- While writing code, try to not write unnecessary comment into code

### Git

Before commit, make sure to:

- Use conventional commit
- Should run `pnpm exec prettier --write .` after writing JS code
- Run `nx lint {projectName} --fix` to apply eslint/golangcilint fix
- If introduce deps, should run `go mod tidy` for go, and `pnpm install` for JS/TS
