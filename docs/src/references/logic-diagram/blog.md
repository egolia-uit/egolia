---
order: 3
---

# Blog

## Class Diagram

```mermaid
classDiagram
    class Post {
        <<AggregateRoot>>
        id uuid.UUID
        authorID string
        content string
        tags []string
    }

    class Comment {
        <<AggregateRoot>>
        id uuid.UUID
        postID uuid.UUID
        authorID string
        content string
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

## Database

```mermaid
erDiagram
    blog_posts {
        UUID id PK
        UUID author_id "Soft Link"
        VARCHAR(255) title
        VARCHAR(255) slug UK "Unique Index"
        TEXT content "HTML / Markdown"
        VARCHAR(50) status "DRAFT, PUBLISHED"
        INT view_count
        TIMESTAMPTZ published_at
    }
    blog_comments {
        UUID id PK
        UUID post_id FK "FK hợp lệ vì nằm trong Blog DB"
        UUID user_id "Soft Link"
        TEXT content
        TIMESTAMPTZ created_at
    }

    blog_posts ||--o{ blog_comments : "has_comments"
```

<!-- vim:set tabstop=4 shiftwidth=4: -->
