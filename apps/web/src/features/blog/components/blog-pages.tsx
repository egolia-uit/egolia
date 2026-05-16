'use client';

import { Calendar, ChevronRight, Edit, Eye, Plus, Trash2, User } from 'lucide-react';
import Link from 'next/link';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/shadcn/badge';
import { Button } from '#/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/shadcn/card';
import type { Viewer } from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

const MOCK_POSTS = [
  {
    slug: 'huong-dan-bat-dau-voi-egolia',
    title: 'Hướng dẫn bắt đầu với Egolia',
    excerpt: 'Tìm hiểu cách đăng ký, chọn khóa học phù hợp và bắt đầu hành trình học tập của bạn trên nền tảng Egolia.',
    author: 'Admin',
    date: '2026-05-10',
    category: 'Hướng dẫn',
    readTime: '5 phút',
  },
  {
    slug: 'top-5-khoa-hoc-duoc-yeu-thich-nhat',
    title: 'Top 5 khóa học được yêu thích nhất tháng 5/2026',
    excerpt: 'Khám phá những khóa học hot nhất trên Egolia với hàng ngàn lượt đăng ký và đánh giá tích cực từ học viên.',
    author: 'Editor',
    date: '2026-05-08',
    category: 'Tin tức',
    readTime: '3 phút',
  },
  {
    slug: 'lam-the-nao-de-hoc-online-hieu-qua',
    title: 'Làm thế nào để học online hiệu quả?',
    excerpt: 'Chia sẻ những mẹo và phương pháp giúp bạn tối ưu hóa thời gian học tập trực tuyến và đạt kết quả tốt nhất.',
    author: 'Admin',
    date: '2026-05-05',
    category: 'Kinh nghiệm',
    readTime: '7 phút',
  },
  {
    slug: 'cap-nhat-tinh-nang-moi-thang-5',
    title: 'Cập nhật tính năng mới tháng 5/2026',
    excerpt: 'Egolia vừa ra mắt nhiều tính năng mới: hệ thống bookmark, đánh giá khóa học, và giao diện được cải thiện.',
    author: 'Dev Team',
    date: '2026-05-01',
    category: 'Cập nhật',
    readTime: '4 phút',
  },
];

function BlogCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  return (
    <Card className="
      bg-white transition-shadow
      hover:shadow-md
    ">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{post.category}</Badge>
          <span className="text-xs text-slate-500">{post.readTime}</span>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm/6 text-slate-600">{post.excerpt}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><User className="size-3" />{post.author}</span>
          <span className="flex items-center gap-1"><Calendar className="size-3" />{post.date}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <Link href={`/blog/${post.slug}`}>
            Đọc thêm
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function BlogListPage() {
  const { viewer } = useViewer();

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Blog"
      title="Tin tức & Hướng dẫn"
    >
      <div className="
        grid gap-4
        md:grid-cols-2
      ">
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
    <AppShell
      viewer={viewer}
      eyebrow="Blog"
      title={post.title}
    >
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{post.category}</Badge>
            <span className="flex items-center gap-1"><User className="size-3.5" />{post.author}</span>
            <span className="flex items-center gap-1"><Calendar className="
              size-3.5
            " />{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </CardHeader>
        <CardContent className="max-w-none">
          <p className="text-lg leading-relaxed text-slate-700">{post.excerpt}</p>
          <div className="mt-6 space-y-4 text-sm/7 text-slate-600">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Nội dung chi tiết của bài viết sẽ được cập nhật khi blog service hoàn thiện.</p>
          </div>
        </CardContent>
      </Card>
      <Button asChild variant="outline">
        <Link href="/blog">← Quay lại danh sách</Link>
      </Button>
    </AppShell>
  );
}

function AdminBlogContent({ viewer }: { viewer: Viewer }) {
  return (
    <AppShell
      viewer={viewer}
      eyebrow="Quản trị"
      title="Quản lý bài viết"
      actions={
        <Button onClick={() => alert('Tính năng tạo bài viết đang phát triển.')}>
          <Plus className="size-4" />
          Tạo bài viết
        </Button>
      }
    >
      <Card className="bg-white">
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
                  <div className="
                    mt-1 flex items-center gap-3 text-xs text-slate-500
                  ">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      <Eye className="size-4" />
                      Xem
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Thao tác thành công!')}>
                    <Edit className="size-4" />
                    Sửa
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => alert('Thao tác thành công!')}>
                    <Trash2 className="size-4" />
                    Xóa
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
