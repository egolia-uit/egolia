---
order: 3
---

# Class Diagram

:::info

- Golang syntax
- Apply DDD, CQRS, repository pattern

:::

## Course

```mermaid
classDiagram
    class CourseStatus {
        <<Enum>>
        DRAFT
        APPROVED
        PUBLISHED
        ARCHIVED
    }

    class Course {
        <<AggregateRoot>>
        ID uuid.UUID
        Title string
        InstructorID uuid.UUID
        Status CourseStatus
        Price float64
        DeletedAt *time.Time
    }

    class Section {
        <<AggregateRoot>>
        ID uuid.UUID
        CourseID uuid.UUID
        Title string
    }

    class Lesson {
        <<AbstractStruct>>
        ID uuid.UUID
        CourseID uuid.UUID
        SectionID uuid.UUID
        NextLessonID *uuid.UUID
        DeletedAt *time.Time
    }

    class TestLesson {
        <<AggregateRoot>>
        Lesson
        Title string
        Type TestLessonType
        Questions []TestQuestion
    }

    class TestQuestion {
        <<Entity>>
        ID uuid.UUID
        Question string
        Anwsers []TestAnswer
    }

    class TestAnswer {
        <<Entity>>
        ID uuid.UUID
        Content string
        IsCorrect bool
    }

    class TestLessonType {
        <<Enum>>
        MULTIPLE_CHOICE
        SINGLE_CHOICE
    }

    class VideoLesson {
        <<AggregateRoot>>
        Lesson
        Title string
        VideoURL string
        Duration time.Duration
    }

    class Enrollment {
        <<AggregateRoot>>
        ID uuid.UUID
        UserID string
        CourseID uuid.UUID
        EnrollmentDate time.Time
        CompletedAt *time.Time
    }

    class LessonProgress {
        <<AbstractStruct>>
        ID uuid.UUID
        UserID string
        LessonID uuid.UUID
        IsCompleted bool
    }

    class LessonProgressTest {
        <<AggregateRoot>>
        LessonProgress
    }

    class LessonProgressVideo {
        <<AggregateRoot>>
        LessonProgress
        WatchedSeconds *float64
        LastViewedAt time.Time
    }

    class LessonComment {
        <<AggregateRoot>>
        ID uuid.UUID
        UserID string
        LessonID uuid.UUID
        Content string
        CreatedAt time.Time
        ParentCommentID *uuid.UUID
    }

    class Review {
        <<AggregateRoot>>
        ID uuid.UUID
        CourseID uuid.UUID
        UserID string
        Rating int
        Comment string
    }

    class Certificate {
        <<AggregateRoot>>
        ID uuid.UUID
        CourseID uuid.UUID
        UserID string
        IssuedAt time.Time
    }

    Course "1" *-- "0..*" Section : has
    Section "1" *-- "0..*" Lesson : has
    TestLesson --|> Lesson
    VideoLesson --|> Lesson
    TestLessonType -- TestLesson
    TestQuestion "1..*" --* "1" TestLesson
    TestAnswer "1..*" --* "1" TestQuestion
    Enrollment "0..*" -- "1" Course : enrolls
    LessonProgressVideo --|> LessonProgress
    LessonProgressTest --|> LessonProgress
    LessonProgress "0..*" --* "1" Lesson : tracks
    Review "0..*" --* "1" Course : reviews
    LessonComment "0..*" --* "1" Lesson : comments
    Certificate "0..*" --* "1" Course : issues
```

## Billing

```mermaid
classDiagram
    class TransactionStatus {
        <<Enum>>
        PENDING
        COMPLETED
        FAILED
    }

    class Transaction {
        <<AggregateRoot>>
        ID uuid.UUID
        UserID string
        Amount float64
        Status TransactionStatus
        CreatedAt time.Time
    }

    Transaction  -- TransactionStatus

    %% class App {
    %%     <<ApplicationHandlers>>
    %%     CheckoutCourse(ctx context.Context, req CheckoutReq)
    %%     GetLearnerBillingHistory(ctx context.Context) []TransactionDTO
    %%     GetTransactionReceiptDetail(ctx ontext.Context
    %%     GetPlatformHeadlineKpis(ctx context.Context) *PlatformKPIDTO
    %%     GetPlatformRevenueAnalytics(ctx context.Context) *RevenueAnalyticsDTO
    %%     GetPlatformTransactionHistory(ctx context.Context) []TransactionDTO
    %% }
```

## Blog

```mermaid
classDiagram
    class Post {
        <<AggregateRoot>>
        ID uuid.UUID
        AuthorID string
        Content string
        Hashtags []string
    }

    class Comment {
        <<AggregateRoot>>
        ID uuid.UUID
        PostID uuid.UUID
        AuthorID string
        Content string
    }

    Comment "0..*" --* "1" Post : comments

    %% class App {
    %%     <<ApplicationHandlers>>
    %%     SearchPosts(ctx context.Context, query string) []PostDTO
    %%     CreatePost(ctx context.Context, req CreatePostReq) string
    %%     CommentOnPost(ctx context.Context, postId string, content string)
    %%     ReplyPostComment(ctx context.Context, commentId string, content string)
    %% }
```

<!-- vim:set tabstop=4 shiftwidth=4: -->
