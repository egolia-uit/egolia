# Monorepo

Manged with Nx. Package manager: pnpm (use ./pnpm-workspace.yaml), go (single go.mod for all packages), mise, buf

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
  otel
  pb
```

## Technologies

### API

- Redocly to bundle and join yaml spec to json
- Scalar render joined spec, mock server
- openapi-generator generate NestJS server code
- heyapi/openapi-ts generate frontend API client code (typescript, react-query, nextjs)
- oapi-codegen generate Go server code (gin, strict server)

### Frontend

- Use shadcn component as much as possible, install into `apps/web`
  - Example: `nx shadcn:add web button`
- Use Tailwind CSS, try to avoid writing custom css and color

## Nx

- Targets are defined in each project `project.json`
- Targets:
  - build
  - run: run in development mode, continuous for go
  - dev: run in development mode, continuous for nextjs
  - start for nextjs style
  - serve/preview: run the built
- Run `nx lint {projectName} --fix` to apply eslint fix for those typescript projects
- Run `nx lint {projectsName}` for golangcilint for those go projects (especially in `cmd/` dir)
- Should run lint whenever changing code

## General Rules

- Temp file must be go into `./tmp/{projectName}`, avoid writing to `/tmp/` when things need to be persisted
- While writing code, try to not write unnecessary comment into code
