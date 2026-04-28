import{ah as a,b as i,e as n,p as l}from"./chunks/framework.40t1VCtJ.js";const D=JSON.parse('{"title":"Billing","description":"","frontmatter":{"order":2},"headers":[],"relativePath":"references/logic-diagram/billing.md","filePath":"references/logic-diagram/billing.md"}'),e={name:"references/logic-diagram/billing.md"};function t(p,s,h,r,k,c){return i(),n("div",{"data-pagefind-body":!0,"data-pagefind-meta":"date:1775234875000"},[...s[0]||(s[0]=[l(`<h1 id="billing" tabindex="-1">Billing <a class="header-anchor" href="#billing" aria-label="Permalink to “Billing”">​</a></h1><h2 id="class-diagram" tabindex="-1">Class Diagram <a class="header-anchor" href="#class-diagram" aria-label="Permalink to “Class Diagram”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">classDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class TransactionStatus {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        pending</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        completed</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        failed</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Transaction {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Amount float64</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Status TransactionStatus</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CreatedAt time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    class Receipt {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        ID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Transaction *Transaction</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UserID string</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        CourseID uuid.UUID</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        Amount float64</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        IssuedAt time.Time</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    Transaction -- TransactionStatus</span></span></code></pre></div><h2 id="database" tabindex="-1">Database <a class="header-anchor" href="#database" aria-label="Permalink to “Database”">​</a></h2><div class="language-mermaid"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes catppuccin-latte catppuccin-mocha" style="--shiki-light:#4c4f69;--shiki-dark:#cdd6f4;--shiki-light-bg:#eff1f5;--shiki-dark-bg:#1e1e2e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">erDiagram</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    transactions {</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID id PK</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID user_id &quot;Soft Link&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        UUID course_id &quot;Soft Link -&gt; billing_course_catalogs&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(100) payment_gateway_ref &quot;Mã tham chiếu Stripe/VNPay&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        DECIMAL(12_2) amount_paid &quot;Chốt cứng giá tiền lúc mua&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        VARCHAR(50) status &quot;PENDING, SUCCESS, FAILED&quot;</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">        TIMESTAMPTZ created_at</span></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4;">    billing_course_catalogs ||--o{ transactions : &quot;purchased_in&quot;</span></span></code></pre></div>`,5)])])}const C=a(e,[["render",t]]);export{D as __pageData,C as default};
