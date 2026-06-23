'use client';

import {
  BookOpen,
  Bookmark,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState, useEffect } from 'react';

import { cn } from '#/components/lib/shadcn/utils';
import { Badge } from '#/components/ui/neumorphism/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import { useToast } from '#/components/ui/neumorphism/toast';
import { Button } from '#/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/shadcn/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/shadcn/dropdown-menu';
import { apiClient } from '#/lib/api';
import {
  type CourseCourse,
  deleteCourse,
  hideCourse,
  unhideCourse,
  bookmarkCourse,
  getMyBookmarkedCourses,
} from '#/lib/api/course';
import { formatVnd } from '#/lib/api/format';
import { useViewer } from '#/lib/auth/use-viewer';

export type CourseDestination = 'public' | 'learner' | 'instructor';
type CourseWithInstructor = CourseCourse & {
  instructorName?: string;
  instructorUsername?: string;
  instructor?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
};

function statusLabel(status?: CourseCourse['status']) {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending';
    case 'draft':
    default:
      return 'Draft';
  }
}

function statusVariant(
  status?: CourseCourse['status']
): 'inset' | 'warning' | 'secondary' {
  switch (status) {
    case 'approved':
      return 'inset';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
}

function destinationHref(
  courseId: string,
  destination: CourseDestination,
  status?: string
) {
  switch (destination) {
    case 'learner':
      return `/learn/courses/${courseId}`;
    case 'instructor':
      return `/instructor/courses/${courseId}${status === 'draft' ? '/builder' : ''}`;
    case 'public':
    default:
      return `/courses/${courseId}`;
  }
}

function instructorDisplayName(course: CourseCourse) {
  const value = course as CourseWithInstructor;
  return (
    value.instructorName ||
    value.instructor?.name ||
    value.instructorUsername ||
    value.instructor?.username ||
    value.instructor?.email ||
    'Instructor'
  );
}

let bookmarksCache: Set<string> | null = null;
let bookmarksPromise: Promise<Set<string>> | null = null;
const bookmarkListeners = new Set<() => void>();

export function useCourseBookmarked(courseId: string | undefined, enabled: boolean) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId || !enabled) return;

    const listener = () => {
      if (bookmarksCache) {
        setIsBookmarked(bookmarksCache.has(courseId));
      }
    };
    bookmarkListeners.add(listener);

    if (bookmarksCache) {
      setIsBookmarked(bookmarksCache.has(courseId));
    } else {
      if (!bookmarksPromise) {
        setLoading(true);
        bookmarksPromise = getMyBookmarkedCourses({
          client: apiClient,
          query: { limit: 100, page: 1 },
        })
          .then(({ data }) => {
            const set = new Set(
              (data?.data || [])
                .map((c) => c.id)
                .filter((id): id is string => Boolean(id))
            );
            bookmarksCache = set;
            bookmarkListeners.forEach((l) => l());
            setLoading(false);
            return set;
          })
          .catch(() => {
            bookmarksCache = new Set();
            setLoading(false);
            return bookmarksCache;
          });
      } else {
        bookmarksPromise.then((set) => {
          setIsBookmarked(set.has(courseId));
        });
      }
    }

    return () => {
      bookmarkListeners.delete(listener);
    };
  }, [courseId, enabled]);

  const toggleBookmark = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      await bookmarkCourse({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
      });
      if (bookmarksCache) {
        if (bookmarksCache.has(courseId)) {
          bookmarksCache.delete(courseId);
        } else {
          bookmarksCache.add(courseId);
        }
        bookmarkListeners.forEach((l) => l());
      } else {
        bookmarksCache = new Set([courseId]);
        bookmarkListeners.forEach((l) => l());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { isBookmarked, loading, toggleBookmark };
}

export function CourseCard({
  course,
  destination = 'public',
  className,
  action,
  progress,
  onRefresh,
}: {
  course: CourseCourse;
  destination?: CourseDestination;
  className?: string;
  action?: ReactNode;
  progress?: number;
  onRefresh?: () => void;
}) {
  const courseId = course.id;
  const href = courseId
    ? destinationHref(courseId, destination, course.status)
    : '#';
  const showProgress = destination === 'learner' && progress !== undefined;
  const showStatusBadges = destination === 'instructor';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { success: showToast, error: showErrorToast } = useToast();

  const { viewer } = useViewer();
  const { isBookmarked, loading: bookmarkLoading, toggleBookmark } = useCourseBookmarked(
    courseId,
    Boolean(viewer?.accessToken)
  );

  const handleToggleHide = async () => {
    if (!courseId) return;
    setBusy(true);
    try {
      if (course.hidden) {
        await unhideCourse({
          client: apiClient,
          path: { courseId },
          throwOnError: true,
        });
        showToast('Course is now visible.');
      } else {
        await hideCourse({
          client: apiClient,
          path: { courseId },
          throwOnError: true,
        });
        showToast('Course is now hidden.');
      }
      onRefresh?.();
    } catch (error) {
      showErrorToast?.('Failed to update course visibility.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId) return;
    setBusy(true);
    try {
      await deleteCourse({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
      });
      showToast('Course has been deleted.');
      setDeleteOpen(false);
      onRefresh?.();
    } catch (error) {
      showErrorToast?.('Failed to delete course.');
    } finally {
      setBusy(false);
    }
  };

  const videoSrc = course.introductionVideoUrl
    ? `${course.introductionVideoUrl}#t=0.001`
    : undefined;

  const cardBody = (
    <Card
      className={cn(
        `
          group flex flex-col overflow-hidden border border-slate-200/60
          bg-white/95
          shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-slate-300/80
          hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]
        `,
        className
      )}
    >
      {/* Thumbnail */}
      <div className="p-3 pb-0">
        <div
          className="
            relative aspect-video w-full overflow-hidden rounded-xl border
            border-slate-100/60 bg-gradient-to-br from-blue-50 via-indigo-50/40
            to-slate-50/80
          "
        >
          {videoSrc ? (
            <video
              className="
                h-full w-full object-cover transition-transform duration-500
                group-hover:scale-105
              "
              muted
              playsInline
              preload="metadata"
              src={videoSrc}
            />
          ) : (
            <div
              className="
                flex h-full w-full flex-col items-center justify-center gap-2
              "
            >
              <div
                className="
                  rounded-full border border-slate-100/50 bg-white/80 p-2.5
                  shadow-sm
                "
              >
                <BookOpen className="size-6 stroke-[1.5] text-indigo-400/80" />
              </div>
            </div>
          )}
          {showStatusBadges && (
            <div
              className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5"
            >
              <Badge variant={statusVariant(course.status)}>
                {statusLabel(course.status)}
              </Badge>
              {course.hidden && (
                <Badge variant="secondary">
                  <EyeOff className="size-3" />
                  Hidden
                </Badge>
              )}
            </div>
          )}
          {/* Learner/Public Bookmark Action */}
          {destination !== 'instructor' && (
            <button
              type="button"
              disabled={bookmarkLoading}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!viewer?.accessToken) {
                  showToast('Please sign in to bookmark courses.');
                  return;
                }
                await toggleBookmark();
                showToast(isBookmarked ? 'Removed from bookmarks.' : 'Saved to bookmarks.');
              }}
              className="
                absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center
                justify-center rounded-full border border-slate-200 bg-white/95
                text-slate-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                transition-all duration-300
                hover:scale-105 hover:bg-white hover:text-slate-900
                active:scale-95
              "
            >
              {bookmarkLoading ? (
                <Loader2 className="size-3.5 animate-spin text-slate-400" />
              ) : (
                <Bookmark
                  className={cn(
                    "size-4 transition-all duration-200",
                    isBookmarked
                      ? "fill-indigo-500 text-indigo-500"
                      : `
                        text-slate-400
                        hover:text-slate-600
                      `
                  )}
                />
              )}
            </button>
          )}
          {/* Instructor Kebab Menu Actions */}
          {destination === 'instructor' && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="
                    absolute top-2.5 right-2.5 z-20 h-8 w-8 rounded-full border
                    border-white/70 bg-white/90 text-slate-600 opacity-90
                    shadow-sm transition-opacity duration-200
                    hover:bg-white hover:text-slate-900
                  "
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="
                  z-30 w-44 rounded-xl border border-slate-200 bg-white p-1
                  shadow-lg
                "
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DropdownMenuItem
                  className="
                    flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2
                    text-sm
                  "
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(false);
                    await handleToggleHide();
                  }}
                >
                  {course.hidden ? (
                    <>
                      <Eye className="size-4" />
                      <span>Unhide course</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-4" />
                      <span>Hide course</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="
                    flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2
                    text-sm text-red-600
                    focus:text-red-700
                  "
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropdownOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="size-4" />
                  <span>Delete course</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle
          className="
            line-clamp-2 min-h-12 text-base leading-snug font-semibold
            text-slate-900 transition-colors duration-200
            group-hover:text-blue-600
          "
        >
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm/6 text-slate-600">
          {course.overview ||
            'Course has no description yet. Content will be updated later.'}
        </p>

        {showProgress && (
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Progress</span>
              <span className="font-semibold text-blue-600">{progress}%</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="
                  h-full rounded-full bg-blue-600 transition-all duration-700
                  ease-out
                "
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata row — flat, no nm shadow */}
        <div
          className="
            mt-auto flex items-center justify-between gap-2 border-t
            border-slate-100 pt-3
          "
        >
          <div className="space-y-0.5">
            <div
              className="
                flex items-center gap-1 text-xs font-semibold text-slate-500
              "
            >
              <BookOpen className="size-3.5 text-slate-400" />
              Price
            </div>
            <div className="text-sm font-bold text-slate-900">
              {formatVnd(course.price)}
            </div>
          </div>
          <div className="min-w-0 space-y-0.5 text-right">
            <div
              className="
                flex items-center justify-end gap-1 text-xs font-semibold
                text-slate-500
              "
            >
              <ShieldCheck className="size-3.5 text-slate-400" />
              Instructor
            </div>
            <div className="truncate text-sm font-semibold text-slate-800">
              {instructorDisplayName(course)}
            </div>
          </div>
        </div>

        {/* Solid CTA for clickable affordance */}
        {!action && (
          <div
            className="
              mt-4 flex items-center justify-center rounded-xl bg-blue-600 px-4
              py-2.5 text-sm font-bold text-white shadow-nm-flat transition-all
              duration-300
              group-hover:bg-blue-500
              group-active:shadow-nm-inset
            "
          >
            <span>
              {destination === 'instructor' ? 'Manage Course' : destination === 'learner' ? 'Continue Learning' : 'Buy Now'}
            </span>
            {destination !== 'public' && (
              <svg
                className="
                  ml-1 size-4 transition-transform duration-300
                  group-hover:translate-x-1
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
            )}
          </div>
        )}
      </CardContent>

      {action && <CardFooter className="px-5 pt-0 pb-5">{action}</CardFooter>}
    </Card>
  );

  return (
    <>
      {action ? (
        cardBody
      ) : (
        <Link
          href={href}
          className="
            block rounded-2xl
            focus-visible:ring-2 focus-visible:ring-blue-500
            focus-visible:ring-offset-2 focus-visible:outline-none
          "
        >
          {cardBody}
        </Link>
      )}

      {destination === 'instructor' && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent
            className="sm:max-w-md"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DialogHeader>
              <DialogTitle>Delete course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{course.title}</strong>?
                This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await handleDelete();
                }}
                className="
                  bg-red-600 text-white
                  hover:bg-red-700
                "
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
