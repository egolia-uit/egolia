FROM golang:1.26.3-alpine3.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 \
  go build \
  -ldflags='-s -w' \
  -o billing \
  ./cmd/billing

FROM alpine:3.23 AS production
WORKDIR /app
COPY --from=builder /app/billing .
EXPOSE 8082 28082
ENTRYPOINT ["./billing"]
