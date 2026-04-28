import{ah as n,b as i,e as a,p as e}from"./chunks/framework.40t1VCtJ.js";const C=JSON.parse('{"title":"Entity","description":"","frontmatter":{"order":4},"headers":[],"relativePath":"references/entity.md","filePath":"references/entity.md"}'),l={name:"references/entity.md"};function p(t,s,h,k,r,o){return i(),a("div",{"data-pagefind-body":!0,"data-pagefind-meta":"date:1777113806000"},[...s[0]||(s[0]=[e(`<h1 id="entity" tabindex="-1">Entity <a class="header-anchor" href="#entity" aria-label="Permalink to “Entity”">​</a></h1><h2 id="course" tabindex="-1">Course <a class="header-anchor" href="#course" aria-label="Permalink to “Course”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">classDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Course {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Title string [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Slug string [gorm:uniqueIndex,not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        InstructorID string [gorm:not_null,column:instructor_id]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Price float64</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Section {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Course *Course [gorm:foreignKey:CourseID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Title string [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        SortOrder integer [gorm:column:sort_order,not_null,default:0]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonBase {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        SectionID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Section *Section [gorm:foreignKey:SectionID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Title string [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        SortOrder integer [gorm:column:sort_order,not_null,default:0]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestLessonType {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Enum&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        multipleChoice</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        singleChoice</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestLesson {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonBase [gorm:embedded]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Type TestLessonType [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Questions []*TestQuestion [gorm:foreignKey:LessonID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestQuestion {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Lesson *TestLesson [gorm:foreignKey:LessonID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Question string [gorm:type:text,not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Options []string [gorm:type:jsonb,not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Answers []*TestAnswer [gorm:foreignKey:QuestionID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestAnswer {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        QuestionID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Question *TestQuestion [gorm:foreignKey:QuestionID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Answer string [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        IsCorrect bool [gorm:default:false]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class VideoLesson {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonBase [gorm:embedded]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VideoURL string [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Duration time.Duration</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Enrollment {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Course *Course [gorm:foreignKey:CourseID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        EnrollmentDate time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CompletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgressBase {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Lesson *LessonBase [gorm:foreignKey:LessonID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        IsCompleted bool [gorm:default:false]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgressTest {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonProgressBase [gorm:embedded]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgressVideo {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonProgressBase [gorm:embedded]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        WatchedSeconds *float64</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LastViewedAt time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonComment {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Lesson *LessonBase [gorm:foreignKey:LessonID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Content string [gorm:type:text,not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ParentCommentID *uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ParentComment *LessonComment [gorm:foreignKey:ParentCommentID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Review {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Course *Course [gorm:foreignKey:CourseID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Rating int [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Comment string [gorm:type:text]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Certificate {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Course *Course [gorm:foreignKey:CourseID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        IssuedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CertificateURL string [gorm:column:certificate_url]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Bookmark {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Course *Course [gorm:foreignKey:CourseID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TransactionStatus {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Enum&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        pending</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        completed</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        failed</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        refunded</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Transaction {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Amount float64 [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Status TransactionStatus [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Blog Entities - THÊM MỚI</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Post {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        AuthorID uuid.UUID [gorm:not_null,column:author_id]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Content string [gorm:type:text,not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Tags []string [gorm:type:jsonb]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class CommentBlog {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID [gorm:primaryKey]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        PostID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Post *Post [gorm:foreignKey:PostID]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        AuthorID uuid.UUID [gorm:not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Content string [gorm:type:text,not_null]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time [gorm:autoCreateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UpdatedAt time.Time [gorm:autoUpdateTime]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DeletedAt *time.Time [gorm:index]</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - COURSE</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Course &quot;1&quot; *-- &quot;0..*&quot; Section : has</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Section &quot;1&quot; *-- &quot;0..*&quot; LessonBase : has</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - LESSONS</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestLesson &quot;1&quot; o-- &quot;1&quot; LessonBase : embeds</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    VideoLesson &quot;1&quot; o-- &quot;1&quot; LessonBase : embeds</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestLesson --|&gt; LessonBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    VideoLesson --|&gt; LessonBase</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - TEST</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestLesson &quot;1&quot; o-- &quot;0..*&quot; TestQuestion : contains</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestQuestion &quot;1&quot; o-- &quot;0..*&quot; TestAnswer : contains</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestLesson -- TestLessonType</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - PROGRESS</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressTest &quot;1&quot; o-- &quot;1&quot; LessonProgressBase : embeds</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressVideo &quot;1&quot; o-- &quot;1&quot; LessonProgressBase : embeds</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressTest --|&gt; LessonProgressBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressVideo --|&gt; LessonProgressBase</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - COURSE INTERACTIONS</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Course &quot;1&quot; --&gt; &quot;0..*&quot; Enrollment : enrolls</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Course &quot;1&quot; --&gt; &quot;0..*&quot; Review : reviews</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Course &quot;1&quot; --&gt; &quot;0..*&quot; Certificate : certificates</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Course &quot;1&quot; --&gt; &quot;0..*&quot; Bookmark : bookmarks</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - LESSON INTERACTIONS</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonBase &quot;1&quot; --&gt; &quot;0..*&quot; LessonProgressBase : tracks</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonBase &quot;1&quot; --&gt; &quot;0..*&quot; LessonComment : comments</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonComment &quot;1&quot; --&gt; &quot;0..*&quot; LessonComment : replies</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - BILLING</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Transaction -- TransactionStatus</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% Relationships - BLOG</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    CommentBlog &quot;0..*&quot; --&gt; &quot;1&quot; Post : comments</span></span></code></pre></div>`,3)])])}const F=n(l,[["render",p]]);export{C as __pageData,F as default};
