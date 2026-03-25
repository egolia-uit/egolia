---
order: 4
---

# Entity

## Course

```mermaid
classDiagram
    class Course {
        ID uuid.UUID
        Title string
        Slug string
        InstructorID uuid.UUID
        Price float64
        DeletedAt *time.Time
    }

    class Section {
        ID uuid.UUID
        Course *Course
        Title string
        Order string
    }

    class LessonBase {
        ID uuid.UUID
        Section *Section
        Title string
        Order string
        DeletedAt *time.Time
    }

    class TestLessonType {
        <<Enum>>
        MultipleChoice
        SingleChoice
    }

    class TestLesson {
        LessonBase
        Type TestLessonType
        Questions []*TestQuestion
    }

    class TestQuestion {
        ID uuid.UUID
        Lesson *TestLesson
        Question string
        Options []string
        Anwsers []*TestAnswer
    }

    class TestAnswer {
        ID uuid.UUID
        Answer string
        IsCorrect bool
    }

    class VideoLesson {
        LessonBase
        VideoURL string
        Duration time.Duration
    }

    class Enrollment {
        ID uuid.UUID
        Course *Course
        StudentID uuid.UUID
        EnrollmentDate time.Time
        CompletedAt *time.Time
    }

    class LessonProgressBase {
        ID uuid.UUID
        UserID string
        Lesson *LessonBase %% TODO: check poly
        IsCompleted bool
        DeletedAt *time.Time
    }

    class LessonProgressTest {
        LessonProgressBase
    }

    class LessonProgressVideo {
        LessonProgressBase
        WatchedSeconds *float64
        LastViewedAt time.Time
    }

    class LessonComment {
        ID uuid.UUID
        UserID string
        Lesson *LessonBase %% TODO: check poly
        Content string
        CreatedAt time.Time
        ParentComment *LessonComment
        DeletedAt *time.Time
    }

    class Review {
        ID uuid.UUID
        Course *Course
        UserID string
        Rating int
        Comment string
        DeletedAt *time.Time
    }

    class Certificate {
        ID uuid.UUID
        Course *Course
        UserID string
        IssuedAt time.Time
        DeletedAt *time.Time
    }

    class Bookmark {
        ID uuid.UUID
        UserID string
        Course *Course
    }

    Course "1" *-- "0..*" Section : has
    Section "1" *-- "0..*" LessonBase : has
    TestLesson --|> LessonBase
    VideoLesson --|> LessonBase
    %% TODO: hehe quan he voi mau hoau
```

<!-- vim:set tabstop=4 shiftwidth=4: -->
