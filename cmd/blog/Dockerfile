FROM golang:1.26.2-alpine3.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 \
  go build \
  -ldflags='-s -w' \
  -o blog \
  ./cmd/blog

FROM alpine:3.23 AS final
WORKDIR /app
COPY --from=builder /app/blog .
EXPOSE 8083 28083
ENTRYPOINT ["./blog"]
