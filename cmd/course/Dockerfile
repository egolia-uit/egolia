FROM golang:1.26.1-alpine3.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 \
  go build \
  # -ldflags "-s -w -extldflags '-static'" \
  -o course \
  ./cmd/course

FROM alpine:3.23 AS final
WORKDIR /app
COPY --from=builder /app/course .
EXPOSE 8080
ENTRYPOINT ["/app/course"]
