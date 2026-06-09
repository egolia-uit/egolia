# Watermill trong Notopia

Notopia sử dụng [Watermill](https://watermill.io/) làm backbone cho event-driven architecture — xử lý domain events, integration events, và real-time streaming.

## Tổng quan kiến trúc

```
Domain Logic
    │
    ▼
[PostgreSQL Outbox]  ──poll 1s──▶  [Kafka]  ──consumer group──▶  [Event Handlers]
    (same DB tx)                      │                                   │
                                      │                              CQRS Processor
                                      ▼                            Direct Handlers
                               [Redis Streams]
                                      │
                               [GoChannel fanout]
                                      │
                               [SSE → Browser]
```

**Ba pipeline độc lập:**

| Pipeline | Mục đích |
|----------|---------|
| Transactional Outbox → Kafka | Đảm bảo domain events không bị mất |
| Kafka → Event Handlers | Xử lý side effects và integration events |
| Kafka → Redis Streams → GoChannel → SSE | Real-time notifications cho browser |

---

## Dependencies

```go
// go.mod
github.com/ThreeDotsLabs/watermill v1.5.1
github.com/ThreeDotsLabs/watermill-kafka/v3 v3.1.2
github.com/ThreeDotsLabs/watermill-sql/v4 v4.1.3
github.com/ThreeDotsLabs/watermill-redisstream v1.4.5
github.com/nkonev/watermill-opentelemetry v0.1.11
```

---

## Brokers

### 1. Kafka — broker chính

Dùng cho domain events (nội bộ) và integration events (liên service).

```go
// internal/note/infra/common/kafkapublisher.go
publisher, err := kafka.NewPublisher(
    kafka.PublisherConfig{
        Brokers: cfg.Brokers,
        Tracer:  tracer, // OpenTelemetry Sarama tracer
    },
    logger,
)
otelPublisher := wotel.NewNamedPublisherDecorator(serviceName.String(), publisher)
```

```go
// internal/note/controller/event/event.go
subscriber, err := kafka.NewSubscriber(
    kafka.SubscriberConfig{
        Brokers:       kafkaCfg.Brokers,
        ConsumerGroup: kafkaCfg.ConsumerGroup,
        Tracer:        tracer,
    },
    logger,
)
```

**Lưu ý quan trọng:** Watermill không hỗ trợ Kafka regex topic (IBM/sarama), nên các handler phải đăng ký từng topic riêng lẻ (xem phần Topics).

### 2. PostgreSQL — Transactional Outbox

Lưu domain events vào cùng transaction với aggregate mutation, đảm bảo atomicity.

```go
// internal/note/infra/outbox/forwarder.go — tạo trong mỗi DB transaction
sqlPublisher, err := sql.NewPublisher(
    sql.TxFromPgx(pgxTx),
    sql.PublisherConfig{
        SchemaAdapter:        f.schemaAdapter,
        AutoInitializeSchema: false,
    },
    watermill.NopLogger{},
)
publisher := forwarder.NewPublisher(sqlPublisher, forwarder.PublisherConfig{})
```

```go
// internal/note/infra/outbox/outbox.go — subscriber poll outbox table
subscriber, err := sql.NewSubscriber(
    sql.BeginnerFromPgx(pgxConn),
    sql.SubscriberConfig{
        PollInterval:     time.Second,
        InitializeSchema: true,
        SchemaAdapter:    schemaAdapter,
        OffsetsAdapter:   sql.DefaultPostgreSQLOffsetsAdapter{},
    },
    logger,
)
```

Schema adapter được config qua `cfg.OutboxTableName`:

```go
// internal/note/infra/outbox/common.go
func NewSchemaAdapter(cfg *config.DomainEvent) *sql.DefaultPostgreSQLSchema {
    return &sql.DefaultPostgreSQLSchema{
        GenerateMessagesTableName: func(_ string) string {
            return cfg.OutboxTableName
        },
    }
}
```

### 3. Redis Streams — real-time workspace events

Dùng để broadcast workspace events qua nhiều instance của note service.

```go
// internal/note/infra/workspaceevent/workspaceevent.go
publisher, err := redisstream.NewPublisher(
    redisstream.PublisherConfig{
        Client:        redisClient,
        DefaultMaxlen: 10000,
    },
    logger,
)

subscriber, err := redisstream.NewSubscriber(
    redisstream.SubscriberConfig{
        Client:                        redisClient,
        FanOutOldestId:                "$", // chỉ nhận messages mới
        DisableIndefiniteInitialBlock: true,
        BlockTime:                     2 * time.Second,
    },
    logger,
)
```

### 4. GoChannel — in-memory fanout

Fan-out từ Redis stream vào từng workspace subscription cụ thể.

```go
internalPubSub: gochannel.NewGoChannel(
    gochannel.Config{OutputChannelBuffer: 100},
    logger,
)
```

---

## Topics

### Domain Events (prefix: `events.internal.note.`)

| Topic | Event |
|-------|-------|
| `events.internal.note.folder.created` | `FolderCreatedEvent` |
| `events.internal.note.folder.deleted` | `FolderDeletedEvent` |
| `events.internal.note.folder.renamed` | `FolderRenamedEvent` |
| `events.internal.note.folder.icon_changed` | `FolderIconChangedEvent` |
| `events.internal.note.folder.moved` | `FolderMovedEvent` |
| `events.internal.note.folder.trashed` | `FolderTrashedEvent` |
| `events.internal.note.folder.restored` | `FolderRestoredEvent` |
| `events.internal.note.folder.permanently_deleted` | `FolderPermanentlyDeletedEvent` |
| `events.internal.note.note.created` | `NoteCreatedEvent` |
| `events.internal.note.note.deleted` | `NoteDeletedEvent` |
| `events.internal.note.note.renamed` | `NoteRenamedEvent` |
| `events.internal.note.note.icon_changed` | `NoteIconChangedEvent` |
| `events.internal.note.note.tags_changed` | `NoteTagsChangedEvent` |
| `events.internal.note.note.size_changed` | `NoteSizeChangedEvent` |
| `events.internal.note.note.outgoing_links_changed` | `NoteOutgoingLinksChangedEvent` |
| `events.internal.note.note.moved` | `NoteMovedEvent` |
| `events.internal.note.note.trashed` | `NoteTrashedEvent` |
| `events.internal.note.note.restored` | `NoteRestoredEvent` |
| `events.internal.note.note.permanently_deleted` | `NotePermanentlyDeletedEvent` |
| `events.internal.note.workspace.renamed` | `WorkspaceRenamedEvent` |
| `events.internal.note.workspace.slug_changed` | `WorkspaceSlugChangedEvent` |
| `events.internal.note.workspace.deleted` | `WorkspaceDeletedEvent` |
| `events.internal.note.poison` | Dead letter queue |

### Integration Events (outbound)

| Topic | Service | Event |
|-------|---------|-------|
| `events.integration.note.note.created` | note | `IntegrationEventNoteCreated` |
| `events.integration.note.note.deleted` | note | `NoteDeletedEvent` |
| `events.integration.note.note.updated` | note | `IntegrationEventNoteUpdated` |
| `events.integration.authorization.user_workspace_role_updated` | authorization | `UserWorkspaceRoleUpdatedEvent` |
| `events.integration.authorization.workspace_member_added` | authorization | `WorkspaceMemberAddedEvent` |
| `events.integration.authorization.workspace_member_removed` | authorization | `WorkspaceMemberRemovedEvent` |

### Integration Events (inbound)

| Topic | From Service | Consumed By |
|-------|-------------|-------------|
| `events.integration.document.document.committed` | document | note service |

---

## Routers và Middleware

### Event Controller Router (`internal/note/controller/event/event.go`)

Router chính xử lý toàn bộ event consumption của note service.

```go
router.AddMiddleware(
    poisonQueueMiddleware,      // failed messages → events.internal.note.poison
    middleware.CorrelationID,   // propagate correlation ID
    middleware.Recoverer,       // recover from panics
    retryMiddleware.Middleware, // 3 retries, 500ms → 10s backoff (multiplier 2)
    wotel.Trace(),              // OpenTelemetry tracing
)
```

**Retry config:**
```go
retryMiddleware := middleware.Retry{
    MaxRetries:      3,
    InitialInterval: 500 * time.Millisecond,
    MaxInterval:     10 * time.Second,
    Multiplier:      2,
    Logger:          logger,
}
```

### Workspace Event Hub Router (`internal/note/infra/workspaceevent/workspaceevent.go`)

```go
router.AddMiddleware(
    middleware.CorrelationID,
    middleware.Recoverer,
    wotel.Trace(),
)
```

### Outbox Router (`internal/note/infra/outbox/outbox.go`)

```go
router.AddMiddleware(
    middleware.Recoverer,
    wotel.Trace(),
)
```

---

## Handlers

### CQRS Event Processor

`cqrs.EventProcessor` tự động route event theo type, mỗi handler có consumer group riêng:

```go
eventProcessor, err := cqrs.NewEventProcessorWithConfig(router,
    cqrs.EventProcessorConfig{
        GenerateSubscribeTopic: func(params cqrs.EventProcessorGenerateSubscribeTopicParams) (string, error) {
            return eventToTopic(params.EventHandler.NewEvent())
        },
        SubscriberConstructor: func(params cqrs.EventProcessorSubscriberConstructorParams) (message.Subscriber, error) {
            return kafka.NewSubscriber(kafka.SubscriberConfig{
                Brokers:       kafkaCfg.Brokers,
                ConsumerGroup: kafkaCfg.ConsumerGroup + "." + params.HandlerName,
                // ...
            }, logger)
        },
        Marshaler: marshaler,
    },
)

eventProcessor.AddHandler(cqrs.NewEventHandler("NotifyWorkspaceRenamedHandler",
    e.app.Events.NotifyWorkspaceRenamed.Handle,
))
```

### Direct Consumer Handlers

Dùng `router.AddConsumerHandler` khi không cần CQRS processor (ví dụ: integration events từ ngoài vào, hoặc nhiều topic cùng một handler):

```go
// Integration event từ document service
e.router.AddConsumerHandler(
    "DocumentCommittedHandler",
    "events.integration.document.document.committed",
    e.subcriber,
    e.documentCommittedHandler,
)

// Phải đăng ký từng topic vì Sarama không hỗ trợ regex
for _, topic := range workspaceItemUpdatedNoteTopics {
    e.router.AddConsumerHandler(
        fmt.Sprintf("NotifyWorkspaceItemsUpdatedHandler.%s", topic),
        topic,
        e.workspaceEventSubcriber,
        e.notifyWorkspaceItemsUpdatedNoteHandler,
    )
}
```

**Hai subscriber riêng biệt** để tránh message stealing:
- `subcriber` — consumer group `{consumerGroup}` — xử lý integration events
- `workspaceEventSubcriber` — consumer group `{consumerGroup}.workspace-event` — xử lý workspace notifications

### Workspace Event Hub Handler

```go
// internal/note/infra/workspaceevent/workspaceevent.go
h.router.AddConsumerHandler(
    "workspace-router",
    h.topic, // "events:workspaces" (Redis stream)
    h.redisSubscriber,
    func(msg *message.Message) error {
        workspaceID := msg.Metadata.Get(h.MetadataWorkspaceIDKey)
        internalTopic := fmt.Sprintf("workspace:%s", workspaceID)
        h.internalPubSub.Publish(internalTopic, msg.Copy())
        return nil
    },
)
```

---

## Message Metadata

Mỗi message mang theo metadata:

| Key | Giá trị | Set bởi |
|-----|---------|---------|
| `workspace_id` | UUID của workspace | `ForwarderPublisher` (domain events) |
| `aggregate_id` | UUID của aggregate (note/folder) | `ForwarderPublisher` |
| `user_id` | ID của user trigger event | `ForwarderPublisher` |
| `event_type` | Loại workspace event (string) | `WorkspaceEventHub.Publish` |
| Correlation ID | UUID của message gốc | `middleware.SetCorrelationID` |

---

## Serialization

Tất cả domain events dùng `cqrs.JSONMarshaler`:

```go
// internal/note/component/watermill.go
func NewWatermillJsonMarshaler() *cqrs.JSONMarshaler {
    return &cqrs.JSONMarshaler{}
}
```

Integration events dùng `json.Marshal` trực tiếp (không qua CQRS marshaler).

---

## OpenTelemetry Integration

### Sarama Tracer (Kafka)

```go
// pkg/otel/watermillkafka.go
type WatermillKafkaTracer struct{ tp trace.TracerProvider }

func (t *WatermillKafkaTracer) WrapConsumer(c sarama.Consumer) sarama.Consumer {
    return otelsarama.WrapConsumer(c, otelsarama.WithTracerProvider(t.tp))
}
// + WrapConsumerGroupHandler, WrapPartitionConsumer, WrapSyncProducer
```

### Publisher Decorator

Mọi publisher đều được wrap với named decorator:

```go
otelPublisher := wotel.NewNamedPublisherDecorator(serviceName.String(), publisher)
```

### Router Middleware

```go
router.AddMiddleware(wotel.Trace())
```

---

## Transactional Outbox — luồng chi tiết

```
HTTP Request
    │
    ▼
Command Handler
    │
    ▼
PostgreSQL Transaction
    ├── UPDATE aggregates (notes/folders/workspaces table)
    └── INSERT domain events (outbox table via sql.Publisher)
    │
    ▼  (commit)
Background Goroutine (forwarder)
    │
    ├── sql.Subscriber polls outbox table every 1s
    │
    ▼
forwarder.Forwarder
    │
    ▼
Kafka Publisher
    │
    ▼
Kafka Topics (events.internal.note.*)
```

`ForwarderPublisher` được tạo mới cho mỗi DB transaction, đảm bảo events được ghi vào cùng transaction với domain changes:

```go
// internal/note/infra/outbox/forwarder.go
func (f *FromPersistenceToQSLForwarder) Create(ctx context.Context, pgxTx pgx.Tx) (pgrepo.Publisher, error) {
    sqlPublisher, err := sql.NewPublisher(sql.TxFromPgx(pgxTx), ...)
    publisher := forwarder.NewPublisher(sqlPublisher, forwarder.PublisherConfig{})
    otelPublisher := wotel.NewNamedPublisherDecorator(f.serviceName, publisher)
    return &ForwarderPublisher{..., publisher: otelPublisher}, nil
}
```

---

## Real-time Workspace Events — luồng chi tiết

```
Event Handler (sau khi process domain event)
    │
    ▼
WorkspaceEventHub.Publish(ctx, workspaceID, userID, events...)
    │  payload = json.Marshal(event)
    │  metadata: workspace_id, user_id, event_type
    ▼
Redis Stream (topic: "events:workspaces", maxlen: 10000)
    │
    ▼  (workspace-router handler)
GoChannel (topic: "workspace:{workspaceID}")
    │
    ▼  (per SSE connection subscription)
WorkspaceEventHub.Subscribe(ctx, workspaceID, userID)
    │  filter: skip own events (same user_id)
    │  buffer: 10 events per connection
    ▼
chan app.WorkspaceEvent
    │
    ▼
SSE Response → Browser
```

---

## Logger

```go
// pkg/logging/watermill.go
func NewWatermill(logger *slog.Logger) watermill.LoggerAdapter {
    return watermill.NewSlogLogger(logger)
}
```

Tất cả Watermill components nhận `watermill.LoggerAdapter` này, tích hợp vào hệ thống `slog` của service.

---

## File Index

| File | Vai trò |
|------|---------|
| [pkg/logging/watermill.go](../../../pkg/logging/watermill.go) | Logger adapter (slog → Watermill) |
| [pkg/otel/watermillkafka.go](../../../pkg/otel/watermillkafka.go) | Sarama OpenTelemetry tracer |
| [internal/note/component/watermill.go](../../../internal/note/component/watermill.go) | JSON marshaler cho CQRS |
| [internal/note/component/eventtopic.go](../../../internal/note/component/eventtopic.go) | Topic mapping cho domain/integration events |
| [internal/note/infra/common/kafkapublisher.go](../../../internal/note/infra/common/kafkapublisher.go) | Kafka publisher (shared) |
| [internal/note/infra/integrationpublisher/integrationpublisher.go](../../../internal/note/infra/integrationpublisher/integrationpublisher.go) | Integration event publisher (note service) |
| [internal/note/infra/outbox/common.go](../../../internal/note/infra/outbox/common.go) | PostgreSQL schema adapter cho outbox table |
| [internal/note/infra/outbox/forwarder.go](../../../internal/note/infra/outbox/forwarder.go) | ForwarderPublisher — viết events vào outbox trong DB tx |
| [internal/note/infra/outbox/outbox.go](../../../internal/note/infra/outbox/outbox.go) | Outbox runner — poll PostgreSQL → forward tới Kafka |
| [internal/note/infra/workspaceevent/workspaceevent.go](../../../internal/note/infra/workspaceevent/workspaceevent.go) | WorkspaceEventHub — Redis Streams + GoChannel + SSE |
| [internal/note/controller/event/event.go](../../../internal/note/controller/event/event.go) | Event controller — Kafka subscribers, CQRS processor, handlers |
| [internal/authorization/infra/integrationevent.go](../../../internal/authorization/infra/integrationevent.go) | Integration event publisher (authorization service) |
