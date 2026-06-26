'use client';

import {
  Calendar,
  Check,
  ChevronLeft,
  CornerDownRight,
  Edit,
  Eye,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useEffect, useState } from 'react';

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
import { Input } from '#/components/ui/neumorphism/input';
import type { Viewer } from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

// Helper: Textarea component styled with neumorphism style
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={`
      flex min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-2
      text-sm text-slate-950
      placeholder:text-slate-400
      focus-visible:border-blue-400 focus-visible:ring-2
      focus-visible:ring-blue-500 focus-visible:outline-none
      disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
      ${className || ''}
    `}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

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
    <Link
      href={`/blog/${post.slug}`}
      className="
        block
        focus-visible:outline-none
      "
    >
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
            <span className="text-xs font-medium text-slate-500">
              {post.readTime}
            </span>
          </div>
          <CardTitle
            className="
              mt-2 line-clamp-2 text-lg font-semibold text-slate-900
              transition-colors duration-200
              group-hover:text-blue-600
            "
          >
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
          <p className="line-clamp-3 text-sm/6 text-slate-600">
            {post.excerpt}
          </p>
          <div
            className="
              mt-auto flex items-center gap-3 border-t border-slate-50 pt-3
              text-xs font-medium text-slate-500
            "
          >
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
  const isLoggedIn = Boolean(viewer?.id && viewer?.accessToken);

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Blog"
      title="News & Guide"
      actions={
        isLoggedIn ? (
          <Button asChild variant="outline">
            <Link href="/admin/blog">
              <Edit className="mr-2 size-4" />
              Demo: Manage Articles
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login?redirect=/admin/blog">
              <Edit className="mr-2 size-4" />
              Demo: Sign in to Manage
            </Link>
          </Button>
        )
      }
    >
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

interface BlogComment {
  id: string;
  author: string;
  content: string;
  date: string;
  replies: BlogComment[];
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
}: {
  comment: BlogComment;
  depth?: number;
  onReply: (id: string, text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const firstLetter = comment.author.charAt(0).toUpperCase();

  return (
    <div className="space-y-3">
      <div
        className={`
          relative flex gap-3 rounded-xl border border-slate-200/60 bg-white/70
          p-4 shadow-[0_4px_20px_rgba(15,23,42,0.02),0_1px_2px_rgba(0,0,0,0.01)]
          backdrop-blur-xs transition-all duration-200
          hover:border-slate-300/80
          ${depth > 0 ? 'ml-6 border-l-2 border-l-blue-500/50' : ''}
        `}
      >
        {/* Connector Line for nested comments */}
        {depth > 0 && (
          <div className="absolute top-1/2 -left-4 -z-10 h-0.5 w-4 bg-blue-100" />
        )}

        {/* Avatar */}
        <div
          className={`
            flex size-9 shrink-0 items-center justify-center rounded-full
            text-sm font-bold
            ${
              comment.author.includes('Admin')
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                : 'bg-slate-100 text-slate-700'
            }
          `}
        >
          {firstLetter}
        </div>

        {/* Content body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {comment.author}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              {new Date(comment.date).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="mt-2 flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="
                  flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5
                  text-sm
                  focus:border-blue-500 focus:outline-hidden
                "
              />
              <Button type="submit" size="sm" className="h-8 py-0">
                <Check className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 py-0"
                onClick={() => setIsEditing(false)}
              >
                <X className="size-3.5" />
              </Button>
            </form>
          ) : (
            <p
              className="
                mt-1 text-sm leading-relaxed break-words text-slate-700
              "
            >
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="mt-2.5 flex gap-3 text-xs text-slate-500">
            {!isEditing && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="
                  flex items-center gap-1 font-medium transition-colors
                  hover:text-blue-600
                "
              >
                <MessageSquare className="size-3" />
                Reply
              </button>
            )}
            {!isEditing && !comment.author.includes('Admin') && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    flex items-center gap-1 font-medium transition-colors
                    hover:text-slate-700
                  "
                >
                  <Edit className="size-3" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="
                    flex items-center gap-1 font-medium transition-colors
                    hover:text-rose-600
                  "
                >
                  <Trash2 className="size-3" />
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <form
              onSubmit={handleReplySubmit}
              className="mt-3 flex gap-2 border-t border-slate-100 pt-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="
                    w-full rounded-lg border border-slate-200 bg-white px-3
                    py-1.5 pr-8 text-sm
                    focus:border-blue-500 focus:outline-hidden
                  "
                />
                <CornerDownRight
                  className="absolute top-2.5 right-2.5 size-3.5 text-slate-400"
                />
              </div>
              <Button type="submit" size="sm" className="h-8 py-0">
                Send
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 py-0"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const { viewer } = useViewer();
  const post = MOCK_POSTS.find((p) => p.slug === slug) ?? MOCK_POSTS[0];

  // Comment state loaded with high-quality default comments matching endpoints:
  // GET /blog/posts/{postId}/comments, POST /blog/posts/{postId}/comments, etc.
  const [comments, setComments] = useState<BlogComment[]>([
    {
      id: 'c1',
      author: 'Alex Johnson',
      content:
        'The guide is so detailed! May I ask if the Egolia auth system using oauth2 flow has a built-in refresh token mechanism?',
      date: '2026-05-25T08:30:00Z',
      replies: [
        {
          id: 'c2',
          author: 'Admin (Dev Team)',
          content:
            'Hi Alex, Egolia uses BetterAuth with Authentik, so refresh tokens are automatically configured as HttpOnly cookies, ensuring security and seamless session renewals!',
          date: '2026-05-25T09:15:00Z',
          replies: [],
        },
      ],
    },
    {
      id: 'c3',
      author: 'Emily Davis',
      content:
        'The bento grid UI with smooth shadow is beautiful. Reading articles is a great experience.',
      date: '2026-05-26T14:20:00Z',
      replies: [],
    },
  ]);

  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    // Simulate POST /blog/posts/{postId}/comments
    const newComment: BlogComment = {
      id: `c_${Date.now()}`,
      author: viewer?.name || 'Anonymous Learner',
      content: newCommentText,
      date: new Date().toISOString(),
      replies: [],
    };

    setComments([...comments, newComment]);
    setNewCommentText('');
  };

  const handleReplyComment = (commentId: string, text: string) => {
    // Simulate POST /blog/comments/{commentId}/replies
    const newReply: BlogComment = {
      id: `c_${Date.now()}`,
      author: viewer?.name || 'Anonymous Learner',
      content: text,
      date: new Date().toISOString(),
      replies: [],
    };

    const addReplyRecursive = (list: BlogComment[]): BlogComment[] => {
      return list.map((item) => {
        if (item.id === commentId) {
          return { ...item, replies: [...item.replies, newReply] };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: addReplyRecursive(item.replies) };
        }
        return item;
      });
    };

    setComments(addReplyRecursive(comments));
  };

  const handleEditComment = (commentId: string, text: string) => {
    // Simulate PUT /blog/comments/{commentId}
    const editRecursive = (list: BlogComment[]): BlogComment[] => {
      return list.map((item) => {
        if (item.id === commentId) {
          return { ...item, content: text, date: new Date().toISOString() };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: editRecursive(item.replies) };
        }
        return item;
      });
    };

    setComments(editRecursive(comments));
  };

  const handleDeleteComment = (commentId: string) => {
    // Simulate DELETE /blog/comments/{commentId}
    const deleteRecursive = (list: BlogComment[]): BlogComment[] => {
      return list
        .filter((item) => item.id !== commentId)
        .map((item) => {
          if (item.replies && item.replies.length > 0) {
            return { ...item, replies: deleteRecursive(item.replies) };
          }
          return item;
        });
    };

    setComments(deleteRecursive(comments));
  };

  return (
    <AppShell viewer={viewer} eyebrow="Blog" title={post.title}>
      <div className="flex flex-col gap-6">
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Badge variant="inset">{post.category}</Badge>
              <span className="flex items-center gap-1">
                <User className="size-3.5 text-slate-400" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" />
                {post.date}
              </span>
              <span>• {post.readTime}</span>
            </div>
          </CardHeader>
          <CardContent className="max-w-none pt-5">
            <p
              className="
                mb-6 rounded-r-lg border-l-4 border-l-blue-600 bg-slate-50/50
                py-3 pl-4 text-base leading-relaxed font-semibold text-slate-900
                italic
              "
            >
              {post.excerpt}
            </p>
            <div className="space-y-4 text-sm/7 leading-relaxed text-slate-700">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <p
                className="
                  rounded-xl border border-amber-200/50 bg-amber-50/40 p-4
                  font-semibold text-slate-900
                "
              >
                ⚠️ Note: The full detail content of this article will be
                officially synced from the server once the Blog database and BE
                services are fully operational.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border border-slate-200 bg-slate-50/40 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle
              className="
                flex items-center gap-2 text-base font-semibold text-slate-900
              "
            >
              <MessageSquare className="size-4.5 text-blue-600" />
              Discussion (
              {comments.length +
                comments.reduce((a, b) => a + b.replies.length, 0)}
              )
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="
                  flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5
                  text-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)]
                  focus:border-blue-500 focus:outline-hidden
                "
              />
              <Button type="submit">
                <Send className="mr-2 size-3.5" />
                Send
              </Button>
            </form>

            {/* Comment Tree */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReplyComment}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))
              ) : (
                <div className="py-6 text-center text-sm text-slate-500">
                  No comments yet. Be the first to share your thoughts!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-2 flex items-center justify-between">
          <Button asChild variant="outline">
            <Link href="/blog">← Back to list</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function AdminBlogContent({ viewer }: { viewer: Viewer }) {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<(typeof MOCK_POSTS)[0] | null>(
    null
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('5 mins');

  useEffect(() => {
    const stored = localStorage.getItem('egolia_demo_posts');
    if (stored) {
      Promise.resolve().then(() => {
        try {
          setPosts(JSON.parse(stored));
        } catch {
          // Ignore invalid JSON format in localStorage
        }
      });
    }
  }, []);

  const updatePosts = (newPosts: typeof MOCK_POSTS) => {
    setPosts(newPosts);
    localStorage.setItem('egolia_demo_posts', JSON.stringify(newPosts));
  };

  const openCreatePage = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setCategory('Guide');
    setReadTime('5 mins');
    setView('create');
  };

  const openEditPage = (post: (typeof MOCK_POSTS)[0]) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.excerpt || '');
    setCategory(post.category);
    setReadTime(post.readTime);
    setView('edit');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingPost) {
      // Edit local post
      const updated = posts.map((p) =>
        p.slug === editingPost.slug
          ? { ...p, title, excerpt: content, category, readTime }
          : p
      );
      updatePosts(updated);
    } else {
      // Create local post
      const newPost = {
        slug: `slug-${Date.now()}`,
        title,
        excerpt: content,
        author: viewer?.name || 'Admin',
        date: new Date().toISOString().split('T')[0],
        category,
        readTime,
      };
      updatePosts([newPost, ...posts]);
    }
    setView('list');
  };

  const handleDeletePost = (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const updated = posts.filter((p) => p.slug !== slug);
    updatePosts(updated);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <AppShell
        viewer={viewer}
        eyebrow="Blog Editor"
        title={
          view === 'create'
            ? 'Create New Article (Demo)'
            : 'Edit Article (Demo)'
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('list')}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={!title.trim() || !content.trim()}
            >
              <Send className="mr-2 size-4" />
              Save Article
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <button
            onClick={() => setView('list')}
            className="
              flex items-center gap-2 text-sm font-medium text-slate-500
              transition-colors
              hover:text-slate-900
            "
          >
            <ChevronLeft className="size-4" />
            Back to articles
          </button>

          <div
            className="
              grid gap-6
              lg:grid-cols-[1fr_300px]
            "
          >
            {/* Main Form Area */}
            <div className="space-y-6">
              <Card className="border border-slate-200 bg-white p-6 shadow-xs">
                <CardContent className="space-y-4 p-0">
                  <div className="space-y-1.5">
                    <label
                      className="
                        text-xs font-semibold tracking-wider text-slate-500
                        uppercase
                      "
                    >
                      Article Title
                    </label>
                    <Input
                      placeholder="Enter article title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-base font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="
                        text-xs font-semibold tracking-wider text-slate-500
                        uppercase
                      "
                    >
                      Article Content
                    </label>
                    <Textarea
                      placeholder="Write your article content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[400px] text-sm leading-relaxed"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metadata Sidebar */}
            <div className="space-y-6">
              <Card className="border border-slate-200 bg-white p-6 shadow-xs">
                <CardHeader className="border-b border-slate-100 p-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Article Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-0 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">
                      Category
                    </label>
                    <Input
                      placeholder="e.g. Guide, News..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">
                      Read time
                    </label>
                    <Input
                      placeholder="e.g. 5 mins, 10 mins..."
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-2 text-xs text-slate-400">
                    <p>
                      Author:{' '}
                      <span className="font-medium text-slate-600">
                        {viewer?.name || 'Admin'}
                      </span>
                    </p>
                    <p className="mt-1">
                      Created Date:{' '}
                      <span className="font-medium text-slate-600">
                        {view === 'create'
                          ? new Date().toLocaleDateString('en-US')
                          : editingPost?.date}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Administration"
      title="Manage Articles"
      actions={
        <Button onClick={openCreatePage}>
          <Plus className="mr-2 size-4" />
          Create Article
        </Button>
      }
    >
      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardContent className="py-4">
          {posts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No articles yet. Click "Create Article" to write one!
            </div>
          ) : (
            <div className="grid gap-3">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="
                    flex flex-col justify-between gap-3 rounded-xl border
                    border-slate-200 p-4 transition-all
                    hover:bg-slate-50/50
                    sm:flex-row sm:items-center
                  "
                >
                  <div className="min-w-0">
                    <div className="line-clamp-1 font-semibold text-slate-900">
                      {post.title}
                    </div>
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
                      onClick={() => openEditPage(post)}
                    >
                      <Edit className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post.slug)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

export function AdminBlogPage() {
  return (
    <AuthGate allowedRoles={['admin', 'instructor', 'learner']}>
      {(viewer) => <AdminBlogContent viewer={viewer} />}
    </AuthGate>
  );
}
