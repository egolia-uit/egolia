import{ah as a,b as i,e as n,p as t}from"./chunks/framework.40t1VCtJ.js";const d=JSON.parse('{"title":"Blog","description":"","frontmatter":{"order":3},"headers":[],"relativePath":"references/logic-diagram/blog.md","filePath":"references/logic-diagram/blog.md"}'),l={name:"references/logic-diagram/blog.md"};function e(p,s,h,k,r,c){return i(),n("div",{"data-pagefind-body":!0,"data-pagefind-meta":"date:1775234875000"},[...s[0]||(s[0]=[t(`<h1 id="blog" tabindex="-1">Blog <a class="header-anchor" href="#blog" aria-label="Permalink to “Blog”">​</a></h1><h2 id="class-diagram" tabindex="-1">Class Diagram <a class="header-anchor" href="#class-diagram" aria-label="Permalink to “Class Diagram”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">classDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Post {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        authorID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        content string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        tags []string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Comment {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        &lt;&lt;AggregateRoot&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        id uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        postID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        authorID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        content string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Comment &quot;0..*&quot; --* &quot;1&quot; Post : comments</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% class App {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %%     &lt;&lt;ApplicationHandlers&gt;&gt;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %%     SearchPosts(ctx context.Context, query string) []PostDTO</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %%     CreatePost(ctx context.Context, req CreatePostReq) string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %%     CommentOnPost(ctx context.Context, postId string, content string)</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %%     ReplyPostComment(ctx context.Context, commentId string, content string)</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    %% }</span></span></code></pre></div><h2 id="database" tabindex="-1">Database <a class="header-anchor" href="#database" aria-label="Permalink to “Database”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">erDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    blog_posts {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID author_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(255) title</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(255) slug UK &quot;Unique Index&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT content &quot;HTML / Markdown&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(50) status &quot;DRAFT, PUBLISHED&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        INT view_count</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ published_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    blog_comments {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID post_id FK &quot;FK hợp lệ vì nằm trong Blog DB&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID user_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TEXT content</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ created_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    blog_posts ||--o{ blog_comments : &quot;has_comments&quot;</span></span></code></pre></div>`,5)])])}const g=a(l,[["render",e]]);export{d as __pageData,g as default};
