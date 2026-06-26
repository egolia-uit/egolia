'use client';

import {
  Bold,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Code,
  CornerDownRight,
  Edit,
  Eye,
  Heading,
  Link2,
  List,
  Loader2,
  MessageSquare,
  PlusCircle,
  Save,
  Search,
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
import { useToast } from '#/components/ui/neumorphism/toast';
import { Skeleton } from '#/components/ui/shadcn/skeleton';
import {
  CourseGridSkeleton,
  EmptyState,
  ErrorState,
} from '#/features/course/components/course-states';
import { apiClient } from '#/lib/api';
import {
  type BlogComment,
  type BlogPost,
  commentOnPost,
  createPost,
  deleteComment,
  deletePost,
  getPostById,
  getPostComments,
  replyComment,
  searchPosts,
  updateComment,
  updatePost,
} from '#/lib/api/blog';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { type Viewer, hasRole } from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

// Helper: Strip Markdown formatting for plaintext excerpt
function stripMarkdown(text = '') {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // link
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/`([^`]+)`/g, '$1') // code
    .replace(/^[#>\s-*+\d.]+\s+/gm, '') // headings, quotes, list bullets
    .trim();
}

// Helper: Inline Markdown parser
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  const regex =
    /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > currentIndex) {
      parts.push(text.substring(currentIndex, matchIndex));
    }

    if (match[1]) {
      parts.push(
        <a
          key={matchIndex}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-blue-600
            hover:underline
          "
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      parts.push(
        <strong key={matchIndex} className="font-bold text-slate-900">
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      parts.push(
        <em key={matchIndex} className="text-slate-800 italic">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      parts.push(
        <code
          key={matchIndex}
          className="
            rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5
            font-mono text-xs text-rose-600
          "
        >
          {match[5]}
        </code>
      );
    }
    currentIndex = regex.lastIndex;
  }

  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  return parts.length > 0 ? parts : [text];
}

// Component: Markdown Renderer
export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentBlockType: 'ul' | 'ol' | 'code' | null = null;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  let listItems: string[] = [];

  const flushList = (key: string | number) => {
    if (currentBlockType === 'ul' && listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${key}`}
          className="my-3 list-disc space-y-1 pl-6 text-slate-700"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    } else if (currentBlockType === 'ol' && listItems.length > 0) {
      elements.push(
        <ol
          key={`ol-${key}`}
          className="my-3 list-decimal space-y-1 pl-6 text-slate-700"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (currentBlockType === 'code') {
        elements.push(
          <pre
            key={`code-${i}`}
            className="
              my-4 overflow-x-auto rounded-xl border border-slate-800
              bg-slate-900 p-4 font-mono text-xs text-slate-100 shadow-inner
            "
          >
            <code
              className={
                codeBlockLang
                  ? ['lang', 'uage-', codeBlockLang].join('')
                  : undefined
              }
            >
              {codeBlockLines.join('\n')}
            </code>
          </pre>
        );
        codeBlockLines = [];
        codeBlockLang = '';
        currentBlockType = null;
      } else {
        flushList(i);
        currentBlockType = 'code';
        codeBlockLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (currentBlockType === 'code') {
      codeBlockLines.push(line);
      continue;
    }

    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    if (ulMatch) {
      if (currentBlockType !== 'ul') {
        flushList(i);
        currentBlockType = 'ul';
      }
      listItems.push(ulMatch[2]);
      continue;
    }

    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (olMatch) {
      if (currentBlockType !== 'ol') {
        flushList(i);
        currentBlockType = 'ol';
      }
      listItems.push(olMatch[2]);
      continue;
    }

    if (currentBlockType === 'ul' || currentBlockType === 'ol') {
      flushList(i);
      currentBlockType = null;
    }

    const trimmed = line.trim();

    if (trimmed === '') {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="
            mt-6 mb-3 border-b border-slate-100 pb-1 text-2xl font-bold
            text-slate-900
          "
        >
          {parseInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mt-5 mb-2.5 text-xl font-semibold text-slate-900"
        >
          {parseInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-4 mb-2 text-lg font-medium text-slate-800"
        >
          {parseInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="
            my-3 rounded-r-lg border-l-4 border-slate-300 bg-slate-50/50 py-2
            pl-4 text-slate-600 italic
          "
        >
          {parseInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    elements.push(
      <p
        key={`p-${i}`}
        className="my-2 text-sm/7 leading-relaxed break-words text-slate-700"
      >
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

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

// Helper: Custom Hooks for State Management
interface BlogPostsState {
  status: 'loading' | 'ready' | 'error';
  data?: {
    data: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: ApiProblem;
}

function useBlogPosts(q: string, tag: string, page: number, reloadTrigger = 0) {
  const [state, setState] = useState<BlogPostsState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setState({ status: 'loading' });
      }
    });

    searchPosts({
      client: apiClient,
      query: {
        q: q || undefined,
        tag: tag || undefined,
        page,
        limit: 10,
      },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data: data as any });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(err) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [q, tag, page, reloadTrigger]);

  return state;
}

interface BlogPostDetailState {
  status: 'loading' | 'ready' | 'error';
  data?: BlogPost;
  error?: ApiProblem;
}

function useBlogPostDetail(postId: string, reloadTrigger = 0) {
  const [state, setState] = useState<BlogPostDetailState>({
    status: 'loading',
  });

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setState({ status: 'loading' });
      }
    });

    getPostById({
      client: apiClient,
      path: { postId },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data: data as BlogPost });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(err) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [postId, reloadTrigger]);

  return state;
}

interface BlogCommentsState {
  status: 'loading' | 'ready' | 'error';
  data?: BlogComment[];
  error?: ApiProblem;
}

function useBlogPostComments(postId: string, reloadTrigger = 0) {
  const [state, setState] = useState<BlogCommentsState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setState({ status: 'loading' });
      }
    });

    getPostComments({
      client: apiClient,
      path: { postId },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data: data.data as BlogComment[] });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(err) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [postId, reloadTrigger]);

  return state;
}

// Helpers for calculating read time and excerpts
const getReadTime = (content = '') => {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const getExcerpt = (content = '') => {
  const clean = stripMarkdown(content);
  return clean.length > 150 ? clean.substring(0, 150) + '...' : clean;
};

const formatDate = (dateInput: Date | string | undefined) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
};

// Comment Tree construction
interface BlogCommentTreeItem {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
  replies: BlogCommentTreeItem[];
}

function buildCommentTree(comments: BlogComment[] = []): BlogCommentTreeItem[] {
  const treeMap: Record<string, BlogCommentTreeItem> = {};

  comments.forEach((c) => {
    treeMap[c.id] = {
      id: c.id,
      authorId: c.authorId,
      content: c.content,
      createdAt: c.createdAt,
      replies: [],
    };
  });

  const roots: BlogCommentTreeItem[] = [];

  comments.forEach((c) => {
    const mapped = treeMap[c.id];
    if (c.parentCommentId && treeMap[c.parentCommentId]) {
      treeMap[c.parentCommentId].replies.push(mapped);
    } else {
      roots.push(mapped);
    }
  });

  const sortByDate = (a: BlogCommentTreeItem, b: BlogCommentTreeItem) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  const sortReplies = (item: BlogCommentTreeItem) => {
    item.replies.sort(sortByDate);
    item.replies.forEach(sortReplies);
  };

  roots.sort(sortByDate);
  roots.forEach(sortReplies);

  return roots;
}

// Subcomponents: BlogCard
function BlogCard({ post }: { post: BlogPost }) {
  const firstTag = post.tags?.[0] || 'General';

  return (
    <Link
      href={`/blog/${post.id}`}
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
            <Badge variant="inset">{firstTag}</Badge>
            <span className="text-xs font-medium text-slate-500">
              {getReadTime(post.content)}
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
            {getExcerpt(post.content)}
          </p>
          <div
            className="
              mt-auto flex items-center gap-3 border-t border-slate-50 pt-3
              text-xs font-medium text-slate-500
            "
          >
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-slate-400" />
              Author: {post.authorId.substring(0, 8)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-slate-400" />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5 text-slate-400" />
              {post.commentCount} comments
            </span>
          </div>

          <div
            className="
              mt-2 flex items-center justify-end gap-1 border-t border-slate-50
              pt-2.5 text-xs font-semibold text-blue-600 transition-colors
              duration-200
              group-hover:text-blue-700
            "
          >
            <span>Read details</span>
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

// Page 1: BlogListPage
export function BlogListPage() {
  const { viewer } = useViewer();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [page, setPage] = useState(1);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const postsState = useBlogPosts(debouncedSearchQuery, activeTag, page);

  const PRESETS_TAGS = [
    'All',
    'Guide',
    'News',
    'Experience',
    'Update',
    'Learning',
    'Productivity',
  ];

  return (
    <AppShell viewer={viewer} eyebrow="Blog" title="News & Guide">
      <div className="mb-6 flex flex-col gap-4">
        {/* Search input with Neumorphism styling */}
        <div className="relative">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute top-3 right-3 size-4.5 text-slate-400" />
        </div>

        {/* Preset Tags Horizontal List */}
        <div className="flex flex-wrap gap-2 py-1">
          {PRESETS_TAGS.map((tag) => {
            const isSelected =
              (tag === 'All' && !activeTag) ||
              activeTag.toLowerCase() === tag.toLowerCase();
            return (
              <Button
                key={tag}
                variant={isSelected ? 'inset' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTag(tag === 'All' ? '' : tag);
                  setPage(1);
                }}
                className="rounded-full px-4"
              >
                {tag}
              </Button>
            );
          })}
        </div>
      </div>

      {postsState.status === 'loading' && <CourseGridSkeleton />}

      {postsState.status === 'error' && (
        <ErrorState error={postsState.error!} />
      )}

      {postsState.status === 'ready' && postsState.data && (
        <>
          {postsState.data.data.length === 0 ? (
            <EmptyState
              title="No articles found"
              description="No articles found matching your keyword or tag."
            />
          ) : (
            <div
              className="
                grid gap-4
                md:grid-cols-2
              "
            >
              {postsState.data.data.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {postsState.data.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={!postsState.data.pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-2 size-4" /> Previous
              </Button>
              <span className="text-sm font-medium text-slate-600">
                Page {postsState.data.pagination.page} of{' '}
                {postsState.data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!postsState.data.pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="ml-2 size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

// Subcomponents: CommentItem
function CommentItem({
  comment,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  viewer,
}: {
  comment: BlogCommentTreeItem;
  depth?: number;
  onReply: (id: string, text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  viewer?: Viewer | null;
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

  const currentUserId = viewer?.id;
  const isAuthor = comment.authorId === currentUserId;
  const isAdmin = hasRole(viewer, 'admin');
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  const displayAuthor = isAuthor
    ? 'You'
    : `User #${comment.authorId.substring(0, 5)}`;
  const firstLetter = displayAuthor.charAt(0).toUpperCase();

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
        {depth > 0 && (
          <div className="absolute top-1/2 -left-4 -z-10 h-0.5 w-4 bg-blue-100" />
        )}

        <div
          className={`
            flex size-9 shrink-0 items-center justify-center rounded-full
            text-sm font-bold
            ${
              isAuthor
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                : 'bg-slate-100 text-slate-700'
            }
          `}
        >
          {firstLetter}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {displayAuthor}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('en-US', {
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
            {!isEditing && canEdit && (
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
            )}
            {!isEditing && canDelete && (
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
            )}
          </div>

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
                <CornerDownRight className="
                  absolute top-2.5 right-2.5 size-3.5 text-slate-400
                " />
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
              viewer={viewer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Page 2: BlogDetailPage
export function BlogDetailPage({ slug }: { slug: string }) {
  const { viewer } = useViewer();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [reloadCommentsTrigger, setReloadCommentsTrigger] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const postState = useBlogPostDetail(slug, reloadTrigger);
  const commentsState = useBlogPostComments(slug, reloadCommentsTrigger);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !postState.data) return;

    setSubmittingComment(true);
    try {
      await commentOnPost({
        client: apiClient,
        path: { postId: postState.data.id },
        body: { content: newCommentText },
        throwOnError: true,
      });
      setNewCommentText('');
      setReloadCommentsTrigger((p) => p + 1);
      showSuccessToast('Comment posted successfully!');
    } catch {
      showErrorToast('Unable to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplyComment = async (commentId: string, text: string) => {
    try {
      await replyComment({
        client: apiClient,
        path: { commentId },
        body: { content: text },
        throwOnError: true,
      });
      setReloadCommentsTrigger((p) => p + 1);
      showSuccessToast('Reply posted successfully!');
    } catch {
      showErrorToast('Unable to post reply. Please try again.');
    }
  };

  const handleEditComment = async (commentId: string, text: string) => {
    try {
      await updateComment({
        client: apiClient,
        path: { commentId },
        body: { content: text },
        throwOnError: true,
      });
      setReloadCommentsTrigger((p) => p + 1);
      showSuccessToast('Comment updated successfully!');
    } catch {
      showErrorToast('Unable to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment({
        client: apiClient,
        path: { commentId },
        throwOnError: true,
      });
      setReloadCommentsTrigger((p) => p + 1);
      showSuccessToast('Comment deleted successfully!');
    } catch {
      showErrorToast('Unable to delete comment. Please try again.');
    }
  };

  if (postState.status === 'loading') {
    return (
      <AppShell viewer={viewer} eyebrow="Blog" title="Loading article...">
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="space-y-4 py-8">
              <Skeleton className="h-8 w-3/4 animate-pulse" />
              <Skeleton className="h-4 w-1/4 animate-pulse" />
              <Skeleton className="h-32 w-full animate-pulse rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (postState.status === 'error') {
    return (
      <AppShell viewer={viewer} eyebrow="Blog" title="Failed to load article">
        <ErrorState
          error={postState.error!}
          onRetry={() => setReloadTrigger((p) => p + 1)}
        />
      </AppShell>
    );
  }

  const post = postState.data!;
  const commentTree = buildCommentTree(commentsState.data || []);
  const totalCommentsCount = (commentsState.data || []).length;

  return (
    <AppShell viewer={viewer} eyebrow="Blog" title={post.title}>
      <div className="flex flex-col gap-6">
        {/* Post content card */}
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div
              className="
                flex flex-wrap items-center gap-3 text-sm text-slate-500
              "
            >
              {post.tags &&
                post.tags.map((tag) => (
                  <Badge key={tag} variant="inset">
                    {tag}
                  </Badge>
                ))}
              <span className="flex items-center gap-1">
                <User className="size-3.5 text-slate-400" />
                Author: {post.authorId.substring(0, 8)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" />
                {formatDate(post.createdAt)}
              </span>
              <span>• {getReadTime(post.content)}</span>
            </div>
          </CardHeader>
          <CardContent className="max-w-none pt-5">
            <div className="text-sm/7 leading-relaxed text-slate-700">
              <MarkdownRenderer content={post.content} />
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
              Discussion ({totalCommentsCount})
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
                disabled={submittingComment}
                className="
                  flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5
                  text-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)]
                  focus:border-blue-500 focus:outline-hidden
                  disabled:bg-slate-50
                "
              />
              <Button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
              >
                {submittingComment ? (
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                ) : (
                  <Send className="mr-2 size-3.5" />
                )}
                Send
              </Button>
            </form>

            {/* Comment Tree */}
            <div className="space-y-4">
              {commentsState.status === 'loading' && (
                <div className="space-y-3 py-4">
                  <Skeleton className="h-16 w-full animate-pulse rounded-xl" />
                  <Skeleton className="ml-6 h-16 w-3/4 animate-pulse rounded-xl" />
                </div>
              )}

              {commentsState.status === 'error' && (
                <div className="py-2 text-center text-sm text-red-500">
                  Failed to load comments.
                </div>
              )}

              {commentsState.status === 'ready' &&
                (commentTree.length > 0 ? (
                  commentTree.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onReply={handleReplyComment}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      viewer={viewer}
                    />
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-slate-500">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ))}
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

// Page 3: AdminBlogPage
function AdminBlogContent({ viewer }: { viewer: Viewer }) {
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const postsState = useBlogPosts('', '', 1, reloadTrigger);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow Textarea Height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(400, textarea.scrollHeight)}px`;
  }, [content, editorTab]);

  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let selected = text.substring(start, end);

    // Smart Word Selection if nothing is selected
    let wordStart = start;
    let wordEnd = end;
    if (start === end) {
      const leftPart = text.substring(0, start).match(/[a-zA-Z0-9_À-ỹ]+$/);
      const rightPart = text.substring(start).match(/^[a-zA-Z0-9_À-ỹ]+/);
      if (leftPart || rightPart) {
        wordStart = start - (leftPart ? leftPart[0].length : 0);
        wordEnd = start + (rightPart ? rightPart[0].length : 0);
        selected = text.substring(wordStart, wordEnd);
      }
    }

    let replacement = '';
    let selectionOffset = 0;
    let newStart = start;
    let newEnd = end;

    const wrap = (prefix: string, suffix = prefix, placeholder = '') => {
      const innerText = selected || placeholder;
      if (
        selected &&
        selected.startsWith(prefix) &&
        selected.endsWith(suffix)
      ) {
        replacement = selected.substring(
          prefix.length,
          selected.length - suffix.length
        );
        selectionOffset = replacement.length;
        newStart = wordStart;
        newEnd = wordStart + replacement.length;
      } else {
        const beforeStart = wordStart - prefix.length;
        const afterEnd = wordEnd + suffix.length;
        const beforeText =
          beforeStart >= 0 ? text.substring(beforeStart, wordStart) : '';
        const afterText =
          afterEnd <= text.length ? text.substring(wordEnd, afterEnd) : '';

        let isSurrounded = beforeText === prefix && afterText === suffix;

        // Special case: make sure a single '*' check does not accidentally match part of '**'
        if (isSurrounded && prefix === '*' && suffix === '*') {
          const beforeBeforeChar =
            wordStart - 2 >= 0 ? text[wordStart - 2] : '';
          const afterAfterChar =
            wordEnd + 1 < text.length ? text[wordEnd + 1] : '';
          if (beforeBeforeChar === '*' || afterAfterChar === '*') {
            isSurrounded = false;
          }
        }

        if (isSurrounded) {
          replacement = innerText;
          selectionOffset = innerText.length;
          wordStart = beforeStart;
          wordEnd = afterEnd;
          newStart = beforeStart;
          newEnd = beforeStart + replacement.length;
        } else {
          replacement = `${prefix}${innerText}${suffix}`;
          selectionOffset = innerText.length;
          newStart = wordStart + prefix.length;
          newEnd = newStart + selectionOffset;
        }
      }
    };

    switch (syntax) {
      case 'bold':
        wrap('**', '**', 'bold text');
        break;
      case 'italic':
        wrap('*', '*', 'italic text');
        break;
      case 'code':
        if (selected.includes('\n')) {
          wrap('\n```javascript\n', '\n```\n', 'code fragment');
        } else {
          wrap('`', '`', 'code fragment');
        }
        break;
      case 'heading':
        wrap('\n### ', '\n', 'Heading');
        break;
      case 'link':
        if (
          selected &&
          selected.startsWith('[') &&
          selected.includes('](') &&
          selected.endsWith(')')
        ) {
          const match = selected.match(/^\[(.*?)\]\((.*?)\)$/);
          replacement = match ? match[1] : selected;
          selectionOffset = replacement.length;
          newStart = wordStart;
          newEnd = wordStart + replacement.length;
        } else {
          const hasLeftBrack =
            wordStart - 1 >= 0 && text[wordStart - 1] === '[';
          const rightPart = text.substring(wordEnd);
          const rightMatch = rightPart.match(/^\]\([^)]*\)/);

          if (hasLeftBrack && rightMatch) {
            const suffixLen = rightMatch[0].length;
            replacement = selected;
            selectionOffset = selected.length;
            wordStart = wordStart - 1;
            wordEnd = wordEnd + suffixLen;
            newStart = wordStart;
            newEnd = wordStart + replacement.length;
          } else {
            replacement = `[${selected || 'link text'}](https://)`;
            selectionOffset = selected ? selected.length : 12;
            newStart = wordStart + 1;
            newEnd = newStart + selectionOffset;
          }
        }
        break;
      case 'list':
        if (selected && selected.startsWith('\n- ')) {
          replacement = selected.substring(3);
          newStart = wordStart;
          newEnd = wordStart + replacement.length;
        } else {
          replacement = `\n- ${selected || 'list item'}`;
          selectionOffset = selected ? selected.length : 13;
          newStart = wordStart + 3;
          newEnd = newStart + selectionOffset;
        }
        break;
      default:
        return;
    }

    textarea.setSelectionRange(wordStart, wordEnd);
    // Use execCommand to preserve native Ctrl+Z undo/redo
    document.execCommand('insertText', false, replacement);

    // Set selection range to wrap the internal text cleanly
    textarea.setSelectionRange(newStart, newEnd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    if (isCmdOrCtrl) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        insertMarkdown('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        insertMarkdown('italic');
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        insertMarkdown('link');
      }
    }
  };

  const renderToolbar = () => (
    <div
      className="
        flex flex-wrap items-center gap-1 rounded-lg border border-slate-200/60
        bg-slate-50/50 p-1 shadow-sm
      "
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown('bold')}
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="size-4 text-slate-600" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown('italic')}
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <span className="font-serif text-sm font-semibold text-slate-600 italic">
          I
        </span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown('heading')}
        className="h-8 w-8 p-0"
        title="Heading"
      >
        <Heading className="size-4 text-slate-600" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown('link')}
        className="h-8 w-8 p-0"
        title="Link"
      >
        <Link2 className="size-4 text-slate-600" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown('code')}
        className="h-8 w-8 p-0"
        title="Code"
      >
        <Code className="size-4 text-slate-600" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown('list')}
        className="h-8 w-8 p-0"
        title="List"
      >
        <List className="size-4 text-slate-600" />
      </Button>
    </div>
  );

  const openCreatePage = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setTags('');
    setEditorTab('write');
    setView('create');
  };

  const openEditPage = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags ? post.tags.join(', ') : '');
    setEditorTab('write');
    setView('edit');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showErrorToast('Title and content cannot be empty.');
      return;
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (editingPost) {
        // Edit mode
        await updatePost({
          client: apiClient,
          path: { postId: editingPost.id },
          body: {
            title,
            content,
            tags: parsedTags,
          },
          throwOnError: true,
        });
        showSuccessToast('Article updated successfully!');
      } else {
        // Create mode
        await createPost({
          client: apiClient,
          body: {
            title,
            content,
            tags: parsedTags,
          },
          throwOnError: true,
        });
        showSuccessToast('Article created successfully!');
      }
      setView('list');
      setReloadTrigger((p) => p + 1);
    } catch {
      showErrorToast(
        'An error occurred while saving the article. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await deletePost({
        client: apiClient,
        path: { postId },
        throwOnError: true,
      });
      showSuccessToast('Article deleted successfully!');
      setReloadTrigger((p) => p + 1);
    } catch {
      showErrorToast('Unable to delete article. Please try again.');
    }
  };

  if (view === 'create' || view === 'edit') {
    return (
      <AppShell
        viewer={viewer}
        eyebrow="Blog Editor"
        title={view === 'create' ? 'Create New Article' : 'Edit Article'}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setView('list')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Article
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <button
            onClick={() => setView('list')}
            disabled={saving}
            className="
              flex items-center gap-2 text-sm font-medium text-slate-500
              transition-colors
              hover:text-slate-900
              disabled:opacity-50
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
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-3">
                    <div
                      className="
                        flex items-center justify-between border-b
                        border-slate-100 pb-2
                      "
                    >
                      <label
                        className="
                          text-xs font-semibold tracking-wider text-slate-500
                          uppercase
                        "
                      >
                        Article Content
                      </label>
                      <div
                        className="
                          flex rounded-lg bg-slate-100/80 p-0.5 shadow-inner
                        "
                      >
                        <button
                          type="button"
                          onClick={() => setEditorTab('write')}
                          className={`
                            rounded-md px-3 py-1.5 text-xs font-semibold
                            transition-all
                            ${
                              editorTab === 'write'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : `
                                  text-slate-500
                                  hover:text-slate-800
                                `
                            }
                          `}
                        >
                          Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorTab('preview')}
                          className={`
                            rounded-md px-3 py-1.5 text-xs font-semibold
                            transition-all
                            ${
                              editorTab === 'preview'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : `
                                  text-slate-500
                                  hover:text-slate-800
                                `
                            }
                          `}
                        >
                          Preview
                        </button>
                      </div>
                    </div>

                    {editorTab === 'write' && renderToolbar()}

                    {editorTab === 'write' ? (
                      <Textarea
                        ref={textareaRef}
                        placeholder="Write your article content using Markdown here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="
                          min-h-[400px] resize-none overflow-y-hidden text-sm
                          leading-relaxed
                        "
                        required
                        disabled={saving}
                      />
                    ) : (
                      <div
                        className="
                          min-h-[400px] max-w-none overflow-y-auto rounded-xl
                          border border-slate-200 bg-slate-50/30 p-6
                          text-slate-700 shadow-inner
                        "
                      >
                        {content ? (
                          <MarkdownRenderer content={content} />
                        ) : (
                          <p className="text-sm text-slate-400 italic">
                            No content to display.
                          </p>
                        )}
                      </div>
                    )}
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
                      Tags (comma separated)
                    </label>
                    <Input
                      placeholder="e.g. guide, news, update..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="pt-2 text-xs text-slate-400">
                    <p>
                      Author ID:{' '}
                      <span className="font-medium text-slate-600">
                        {viewer?.id?.substring(0, 8)}
                      </span>
                    </p>
                    {editingPost && (
                      <p className="mt-1">
                        Created Date:{' '}
                        <span className="font-medium text-slate-600">
                          {formatDate(editingPost.createdAt)}
                        </span>
                      </p>
                    )}
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
          <PlusCircle className="mr-2 size-4" />
          Create Article
        </Button>
      }
    >
      {postsState.status === 'loading' && <CourseGridSkeleton />}

      {postsState.status === 'error' && (
        <ErrorState
          error={postsState.error!}
          onRetry={() => setReloadTrigger((p) => p + 1)}
        />
      )}

      {postsState.status === 'ready' && postsState.data && (
        <Card>
          <CardContent className="py-4">
            {postsState.data.data.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No articles found. Be the first to write an article!
              </div>
            ) : (
              <div className="grid gap-3">
                {postsState.data.data.map((post) => (
                  <div
                    key={post.id}
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
                        <span>Author ID: {post.authorId.substring(0, 8)}</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <div className="flex gap-1">
                          {post.tags &&
                            post.tags.slice(0, 2).map((t) => (
                              <Badge
                                key={t}
                                variant="secondary"
                                className="py-0 text-[10px]"
                              >
                                {t}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.id}`}>
                          <Eye className="mr-1 size-4" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditPage(post)}
                      >
                        <Edit className="mr-1 size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="mr-1 size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
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
