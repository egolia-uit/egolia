'use client';

import {
  Calendar,
  Edit,
  Eye,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import type { Viewer } from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

const MOCK_POSTS = [
  {
    slug: 'huong-dan-bat-dau-voi-egolia',
    title: 'Getting Started with Egolia',
    excerpt:
      'Learn how to register, choose the right course, and start your learning journey on Egolia.',
    author: 'Admin',
    date: '2026-05-10',
    category: 'Guide',
    readTime: '5 mins',
  },
  {
    slug: 'top-5-khoa-hoc-duoc-yeu-thich-nhat',
    title: 'Top 5 Most Popular Courses in May 2026',
    excerpt:
      'Discover the hottest courses on Egolia with thousands of enrollments and positive reviews.',
    author: 'Editor',
    date: '2026-05-08',
    category: 'News',
    readTime: '3 mins',
  },
  {
    slug: 'lam-the-nao-de-hoc-online-hieu-qua',
    title: 'How to Learn Online Effectively?',
    excerpt:
      'Share tips and methods to help you optimize your online learning time and achieve the best results.',
    author: 'Admin',
    date: '2026-05-05',
    category: 'Experience',
    readTime: '7 mins',
  },
  {
    slug: 'cap-nhat-tinh-nang-moi-thang-5',
    title: 'New Feature Updates in May 2026',
    excerpt:
      'Egolia has launched many new features: bookmark system, course reviews, and improved UI.',
    author: 'Dev Team',
    date: '2026-05-01',
    category: 'Update',
    readTime: '4 mins',
  },
];

function BlogCard({ post }: { post: (typeof MOCK_POSTS)[0] }) {
  return (
    <Link href={`/blog/${post.slug}`} className="
      block
      focus-visible:outline-none
    ">
      <Card
        className="
          group flex h-full flex-col overflow-hidden border border-slate-200/60
          bg-white/95
          shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-slate-300/80
          hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]
        "
      >
        <CardHeader className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="inset">{post.category}</Badge>
            <span className="text-xs font-medium text-slate-500">{post.readTime}</span>
          </div>
          <CardTitle className="
            mt-2 line-clamp-2 text-lg font-semibold text-slate-900
            transition-colors duration-200
            group-hover:text-blue-600
          ">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
          <p className="line-clamp-3 text-sm/6 text-slate-600">{post.excerpt}</p>
          <div className="
            mt-auto flex items-center gap-3 border-t border-slate-50 pt-3
            text-xs font-medium text-slate-500
          ">
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-slate-400" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-slate-400" />
              {post.date}
            </span>
          </div>
          
          {/* Subtle Read more CTA for clickable affordance */}
          <div
            className="
              mt-2 flex items-center justify-end gap-1 border-t border-slate-50
              pt-2.5 text-xs font-semibold text-blue-600 transition-colors
              duration-200
              group-hover:text-blue-700
            "
          >
            <span>Read more</span>
            <svg
              className="
                size-3.5 transition-transform duration-300
                group-hover:translate-x-0.5
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BlogListPage() {
  const { viewer } = useViewer();

  return (
    <AppShell viewer={viewer} eyebrow="Blog" title="News & Guide">
      <div
        className="
          grid gap-4
          md:grid-cols-2
        "
      >
        {MOCK_POSTS.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </AppShell>
  );
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const { viewer } = useViewer();
  const post = MOCK_POSTS.find((p) => p.slug === slug) ?? MOCK_POSTS[0];

  return (
    <AppShell viewer={viewer} eyebrow="Blog" title={post.title}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Badge variant="inset">{post.category}</Badge>
            <span className="flex items-center gap-1">
              <User className="size-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar
                className="size-3.5"
              />
              {post.date}
            </span>
            <span>{post.readTime}</span>
          </div>
        </CardHeader>
        <CardContent className="max-w-none">
          <p className="text-lg leading-relaxed text-slate-700">
            {post.excerpt}
          </p>
          <div className="mt-6 space-y-4 text-sm/7 text-slate-600">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
            <p>
              The detailed content of the article will be updated when the blog
              service is completed.
            </p>
          </div>
        </CardContent>
      </Card>
      <Button asChild variant="outline">
        <Link href="/blog">← Back to list</Link>
      </Button>
    </AppShell>
  );
}

function AdminBlogContent({ viewer }: { viewer: Viewer }) {
  return (
    <AppShell
      viewer={viewer}
      eyebrow="Administration"
      title="Manage Articles"
      actions={
        <Button
          onClick={() =>
            alert('Article creation feature is under development.')
          }
        >
          <Plus className="size-4" />
          Create Article
        </Button>
      }
    >
      <Card>
        <CardContent className="py-4">
          <div className="grid gap-3">
            {MOCK_POSTS.map((post) => (
              <div
                key={post.slug}
                className="
                  flex items-center justify-between gap-3 rounded-lg border
                  border-slate-200 p-4
                "
              >
                <div className="min-w-0">
                  <div className="font-medium">{post.title}</div>
                  <div
                    className="
                      mt-1 flex items-center gap-3 text-xs text-slate-500
                    "
                  >
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      <Eye className="size-4" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Action successful!')}
                  >
                    <Edit className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => alert('Action successful!')}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export function AdminBlogPage() {
  return (
    <AuthGate allowedRoles={['admin']}>
      {(viewer) => <AdminBlogContent viewer={viewer} />}
    </AuthGate>
  );
}
