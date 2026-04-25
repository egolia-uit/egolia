FROM golang:1.26.2-alpine3.23 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 \
  go build \
  -ldflags='-s -w' \
  -o course \
  ./cmd/course

FROM alpine:3.23 AS final
WORKDIR /app
COPY --from=builder /app/course .
EXPOSE 8081 28081
ENTRYPOINT ["./course"]
