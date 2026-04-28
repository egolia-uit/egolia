import{ah as n,b as i,e as a,p as l}from"./chunks/framework.40t1VCtJ.js";const F=JSON.parse('{"title":"Course","description":"","frontmatter":{"order":3},"headers":[],"relativePath":"references/logic-diagram/course.md","filePath":"references/logic-diagram/course.md"}'),p={name:"references/logic-diagram/course.md"};function e(t,s,h,k,D,r){return i(),a("div",{"data-pagefind-body":!0,"data-pagefind-meta":"date:1776408161000"},[...s[0]||(s[0]=[l(`<h1 id="course" tabindex="-1">Course <a class="header-anchor" href="#course" aria-label="Permalink to “Course”">​</a></h1><div class="info custom-block"><p class="custom-block-title custom-block-title-default">INFO</p><ul><li>Golang syntax</li><li>Apply DDD, Clean architecture</li></ul></div><h2 id="domain-model" tabindex="-1">Domain Model <a class="header-anchor" href="#domain-model" aria-label="Permalink to “Domain Model”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">classDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class CourseStatus {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Enum&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        draft</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        approved</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        published</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        archived</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">     }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Course {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        title string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        instructorID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        status CourseStatus</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        price float64</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Section {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        courseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        title string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        order string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Lesson {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Interface&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonBase {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AbstractStruct&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        sectionID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        title string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        order string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestLessonType {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Enum&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        multipleChoice</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        singleChoice</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestLesson {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        type TestLessonType</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        questions []*TestQuestion</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestQuestion {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Entity&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        question string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        anwsers []*TestAnswer</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TestAnswer {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Entity&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        content string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        isCorrect bool</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class VideoLesson {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        videoKey string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        duration time.Duration</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Enrollment {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        learnerID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        courseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        enrollmentDate time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        completedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgress {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;Interface&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgressBase {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AbstractStruct&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        enrollmentID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        lessonID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        isCompleted bool</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgressTest {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonProgressBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonProgressVideo {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        LessonProgressBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        watchedSeconds *float64</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        lastViewedAt time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class LessonComment {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        userID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        lessonID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        content string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        createdAt time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        parentCommentID *uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Review {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        courseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        userID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        rating int</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        comment string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Certificate {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        courseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        userID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        issuedAt time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        deletedAt *time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Bookmark {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        userID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        courseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    CourseStatus -- Course</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Course &quot;1&quot; *.. &quot;0..*&quot; Section : has</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Section &quot;1&quot; *.. &quot;0..*&quot; Lesson : has</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonBase --|&gt; Lesson</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestLesson --* LessonBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    VideoLesson --* LessonBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestLesson -- TestLessonType</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestQuestion &quot;1..*&quot; --* &quot;1&quot; TestLesson</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    TestAnswer &quot;1..*&quot; --* &quot;1&quot; TestQuestion</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Enrollment &quot;0..*&quot; .. &quot;1&quot; Course : enrolls</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressVideo --* LessonProgressBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressTest --* LessonProgressBase</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgressBase --|&gt; LessonProgress</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgress &quot;0..*&quot; ..* &quot;1&quot; Lesson : tracks</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonProgress &quot;0..*&quot; ..* &quot;1&quot; Enrollment : belongs to</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Review &quot;0..*&quot; ..* &quot;1&quot; Course : reviews</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    LessonComment &quot;0..*&quot; ..* &quot;1&quot; Lesson : comments</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Certificate &quot;0..*&quot; ..* &quot;1&quot; Course : issues</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Bookmark &quot;0..*&quot; ..* &quot;1&quot; Course : bookmarks</span></span></code></pre></div><h2 id="entity" tabindex="-1">Entity <a class="header-anchor" href="#entity" aria-label="Permalink to “Entity”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">classDiagram</span></span>
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
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VideoKey string [gorm:not_null]</span></span>
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
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    CommentBlog &quot;0..*&quot; --&gt; &quot;1&quot; Post : comments</span></span></code></pre></div><h2 id="database" tabindex="-1">Database <a class="header-anchor" href="#database" aria-label="Permalink to “Database”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">erDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    courses {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID instructor_id &quot;Soft Link (User Service)&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(255) title</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DECIMAL(12_2) price &quot;Vd: 9999999999.99&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(50) status &quot;DRAFT, REVIEW, PUBLISHED&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ created_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ updated_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    sections {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(255) title</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        SMALLINT sort_order</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lessons {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID section_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(255) title</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        SMALLINT sort_order</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(50) lesson_type &quot;VIDEO, TEST&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    video_lessons {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID lesson_id PK, FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(1024) video_key</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        INT duration_seconds</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    test_lessons {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID lesson_id PK, FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(50) test_type &quot;multiple_choice, single_choice&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    test_questions {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID test_lesson_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT question_text</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT[] options</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    test_answers {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID question_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT answer_text</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        BOOLEAN is_correct</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    reviews {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID user_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        INT rating &quot;Not Null&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT comment</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ created_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ updated_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ deleted_at &quot;Soft Delete (Index)&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    certificates {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID user_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(1024) certificate_url</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ issued_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ deleted_at &quot;Soft Delete (Index)&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    bookmarks {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID user_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ created_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    read_courses {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(255) title</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DECIMAL(12_2) price</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        JSONB full_course_content &quot;Denormalized: Gom sạch Section/Lesson vào 1 file JSON&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ published_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    enrollments {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK &quot;Aggregate Root của Tracking&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id FK &quot;FK hợp lệ vì nằm chung Course DB&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID learner_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ enrolled_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ expired_at &quot;NULL = Học trọn đời&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lesson_progresses {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID enrollment_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID lesson_id FK &quot;Chỉ tới Lessons để biết đang học bài nào&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(50) progress_type &quot;VIDEO, TEST&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        BOOLEAN is_completed</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ updated_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    video_progresses {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID progress_id PK, FK &quot;Đa hình 1-1&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        INT watched_seconds &quot;Giây đang xem dở&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ last_viewed_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    test_progresses {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID progress_id PK, FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DECIMAL(5_2) score</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lesson_comments {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID lesson_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID learner_id</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT content</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID parent_comment_id FK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ created_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    courses ||--o{ sections : &quot;has&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    sections ||--o{ lessons : &quot;contains&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lessons ||--o| video_lessons : &quot;is_type&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lessons ||--o| test_lessons : &quot;is_type&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    test_lessons ||--o{ test_questions : &quot;contains&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    test_questions ||--o{ test_answers : &quot;has&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    enrollments ||--o{ lesson_progresses : &quot;tracks&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lesson_progresses ||--o| video_progresses : &quot;is_type&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    lesson_progresses ||--o| test_progresses : &quot;is_type&quot;</span></span></code></pre></div>`,8)])])}const o=n(p,[["render",e]]);export{F as __pageData,o as default};
