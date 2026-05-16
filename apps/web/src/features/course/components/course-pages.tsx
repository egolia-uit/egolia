'use client';

import {
  BarChart3,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FilePlus2,
  Filter,
  Layers3,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
  Pencil,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type DependencyList,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/shadcn/badge';
import { Button } from '#/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/shadcn/card';
import { Input } from '#/components/ui/shadcn/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/shadcn/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/shadcn/table';
import { apiClient } from '#/lib/api';
import {
  type CourseCourse,
  type CourseCourseDetail,
  type CourseReview,
  type CourseCourseWritable,
  approveCourse,
  bookmarkCourse,
  createCourse,
  createDraftVersion,
  declineCourse,
  deleteCourse,
  finishCourse,
  getCourseDetail,
  getCourseForUpdate,
  getCourseLandingPage,
  getCourseReviews,
  getMyBookmarkedCourses,
  getMyCourses,
  getMyEnrolledCourses,
  getPublishedCourses,
  getSystemCourses,
  getUploadVideoUrl,
  hideCourse,
  reviewCourse,
  unbookmarkCourse,
  unhideCourse,
  updateCourse,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatDateTime, formatVnd } from '#/lib/api/format';
import { putFileToSignedUrl } from '#/lib/api/upload';
import { routeForViewer, type Viewer } from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

import { CourseCard } from './course-card';
import { CourseHero, CourseStructure } from './course-detail';
import { CourseForm } from './course-form';
import {
  CourseGridSkeleton,
  EmptyState,
  ErrorState,
  InlineNotice,
} from './course-states';

type ResourceState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: ApiProblem };

type CourseListResponse = {
  data: CourseCourse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

type CourseReviewsResponse = {
  data?: CourseReview[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

type UploadProgressCallback = (progress: number) => void;

function normalizeTab(value: string | undefined, allowed: string[]) {
  return value && allowed.includes(value) ? value : allowed[0];
}

function courseStatusLabel(course: CourseCourse) {
  return course.status ?? 'draft';
}

function isDraftLike(course: CourseCourse) {
  return courseStatusLabel(course) === 'draft';
}

function isPendingLike(course: CourseCourse) {
  return courseStatusLabel(course) === 'pending';
}

function MockPanel({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <Card className="border-dashed bg-white">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Mock
          </Badge>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="
        grid gap-3
        md:grid-cols-2
      ">
        {items.map((item) => (
          <div
            key={item}
            className="
              rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm
              text-slate-700
            "
          >
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RoleTabs({
  active,
  tabs,
}: {
  active: string;
  tabs: Array<{
    href: string;
    label: string;
    icon: typeof BookOpen;
    value: string;
    }>;
}) {
  return (
    <div className="
      flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2
    ">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          asChild
          size="sm"
          variant={active === tab.value ? 'default' : 'ghost'}
          className="shrink-0"
        >
          <Link href={tab.href}>
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

async function uploadCourseVideo(
  courseId: string,
  file: File,
  onProgress?: UploadProgressCallback
) {
  const { data } = await getUploadVideoUrl({
    body: { videoFilename: file.name },
    client: apiClient,
    path: { courseId },
    throwOnError: true,
  });

  await putFileToSignedUrl(data.uploadUrl, file, onProgress);
  return data;
}

function useCourseList(
  loader: () => Promise<CourseListResponse>,
  deps: DependencyList
) {
  const [state, setState] = useState<ResourceState<CourseListResponse>>({
    status: 'loading',
  });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    loader()
      .then((data) => {
        if (mounted) {
          setState({ status: 'ready', data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [...deps, reloadKey]);

  return { state, reload };
}

function useCourseDetail(courseId: string) {
  const [state, setState] = useState<ResourceState<CourseCourseDetail>>({
    status: 'loading',
  });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    getCourseDetail({
      client: apiClient,
      path: { courseId },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data: data.data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId, reloadKey]);

  return { state, setState, reload };
}

function useCourseReviews(courseId: string) {
  const [state, setState] = useState<ResourceState<CourseReviewsResponse>>({
    status: 'loading',
  });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    getCourseReviews({
      client: apiClient,
      path: { courseId },
      query: { limit: 6, page: 1 },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId, reloadKey]);

  return { state, reload };
}

function ResultMeta({ result }: { result: CourseListResponse }) {
  return (
    <div className="text-sm text-slate-500">
      {result.pagination.total} khóa học · trang {result.pagination.page}/
      {Math.max(result.pagination.totalPages, 1)}
    </div>
  );
}

function CourseGrid({
  courses,
  destination,
  actionFor,
}: {
  courses: CourseCourse[];
  destination?: 'public' | 'learner' | 'instructor';
  actionFor?: (course: CourseCourse) => ReactNode;
}) {
  return (
    <div
      className="
        grid gap-4
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id ?? course.title}
          course={course}
          destination={destination}
          action={actionFor?.(course)}
        />
      ))}
    </div>
  );
}

function ListContent({
  state,
  reload,
  emptyTitle,
  emptyDescription,
  destination,
  actionFor,
}: {
  state: ResourceState<CourseListResponse>;
  reload: () => void;
  emptyTitle: string;
  emptyDescription: string;
  destination?: 'public' | 'learner' | 'instructor';
  actionFor?: (course: CourseCourse) => ReactNode;
}) {
  if (state.status === 'loading') {
    return <CourseGridSkeleton />;
  }

  if (state.status === 'error') {
    return <ErrorState error={state.error} onRetry={reload} />;
  }

  if (!state.data.data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ResultMeta result={state.data} />
      <CourseGrid
        actionFor={actionFor}
        courses={state.data.data}
        destination={destination}
      />
    </div>
  );
}

function CourseReviewsPanel({
  state,
  reload,
}: {
  state: ResourceState<CourseReviewsResponse>;
  reload: () => void;
}) {
  if (state.status === 'loading') {
    return <CourseGridSkeleton />;
  }

  if (state.status === 'error') {
    return <ErrorState error={state.error} onRetry={reload} />;
  }

  const reviews = state.data.data ?? [];

  if (!reviews.length) {
    return (
      <EmptyState
        title="Chưa có đánh giá"
        description="Khóa học này chưa có đánh giá nào."
      />
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>
          Real API: getCourseReviews. Total:{' '}
          {state.data.pagination?.total ?? reviews.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">Rating {review.rating}/5</div>
              <div className="text-xs text-slate-500">
                {formatDateTime(review.createdAt)}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
            <p className="mt-2 text-xs text-slate-500">
              User: {review.userId}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MarketplacePage({
  initialTab = 'marketplace',
}: {
  initialTab?: string;
}) {
  const { viewer } = useViewer();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { state, reload } = useCourseList(
    () =>
      getPublishedCourses({
        client: apiClient,
        query: {
          limit: 12,
          page: 1,
          query: submittedQuery || undefined,
        },
        throwOnError: true,
      }).then(({ data }) => data),
    [submittedQuery]
  );

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Khám phá"
      title="Khám phá khóa học"

      actions={
        <Button type="button" variant="outline" onClick={reload}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      }
    >

      <Card className="bg-white">
        <CardContent
          className="
            flex flex-col gap-3 py-4
            md:flex-row
          "
        >
          <div className="relative flex-1">
            <Search
              className="
                pointer-events-none absolute top-1/2 left-2.5 size-4
                -translate-y-1/2 text-slate-400
              "
            />
            <Input
              className="pl-8"
              placeholder="Tìm khóa học theo tên hoặc mô tả"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setSubmittedQuery(query.trim());
                }
              }}
            />
          </div>
          <Button type="button" onClick={() => setSubmittedQuery(query.trim())}>
            <Filter className="size-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <ListContent
        state={state}
        reload={reload}
        destination="public"
        emptyTitle="Chưa có khóa học"
        emptyDescription="Chưa có khóa học nào được xuất bản."
      />
    </AppShell>
  );
}

export function PublicCoursePage({ courseId }: { courseId: string }) {
  const { viewer } = useViewer();
  const primaryHref = viewer?.id ? routeForViewer(viewer) : '/login';
  const primaryLabel = viewer?.id ? 'Má»Ÿ dashboard' : 'Sign in Ä‘á»ƒ há»c';
  const reviews = useCourseReviews(courseId);
  const [state, setState] = useState<ResourceState<CourseCourse>>({
    status: 'loading',
  });

  useEffect(() => {
    let mounted = true;

    getCourseLandingPage({
      client: apiClient,
      path: { courseId },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setState({ status: 'ready', data: data.data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Chi tiết khóa học"
      title="Tổng quan khóa học"
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && <ErrorState error={state.error} />}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <CourseHero
            course={state.data}
            actions={
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  className="
                    w-full bg-white text-slate-950
                    hover:bg-slate-100
                  "
                >
                  <Link href={primaryHref}>
                    <BookOpen className="size-4" />
                    {primaryLabel}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="
                    w-full border-white/20 text-white
                    hover:bg-white/10 hover:text-white
                  "
                >
                  <Link href="/courses">Back to marketplace</Link>
                </Button>
              </div>
            }
          />
          <CourseReviewsPanel state={reviews.state} reload={reviews.reload} />
        </div>
      )}
    </AppShell>
  );
}

function LearnerHomeContent({
  initialTab,
  viewer,
}: {
  initialTab: string;
  viewer: Viewer;
}) {
  const activeTab = normalizeTab(initialTab, [
    'home',
    'enrolled',
    'bookmarked',
  ]);
  const enrolled = useCourseList(
    () =>
      getMyEnrolledCourses({
        client: apiClient,
        query: { limit: 12, page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );
  const bookmarked = useCourseList(
    () =>
      getMyBookmarkedCourses({
        client: apiClient,
        query: { limit: 12, page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Học tập"
      title="Không gian học tập"
      actions={
        <Button asChild>
          <Link href="/courses">
            <Search className="size-4" />
            Khám phá khóa học
          </Link>
        </Button>
      }
    >
      {(activeTab === 'home' || activeTab === 'enrolled') && (
        <section className="grid gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Đang học</h2>
          <ListContent
            state={enrolled.state}
            reload={enrolled.reload}
            destination="learner"
            emptyTitle="Bạn chưa đăng ký khóa học nào"
            emptyDescription="Vào khám phá để xem các khóa học đang mở."
          />
        </div>
        {activeTab === 'home' && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Đã lưu</h2>
          <ListContent
            state={bookmarked.state}
            reload={bookmarked.reload}
            destination="learner"
            emptyTitle="Chưa có bookmark"
            emptyDescription="Bookmark giúp bạn quay lại khóa học nhanh hơn."
          />
        </div>
        )}
      </section>
      )}

      {activeTab === 'bookmarked' && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Đã lưu</h2>
          <ListContent
            state={bookmarked.state}
            reload={bookmarked.reload}
            destination="learner"
            emptyTitle="Chưa có bookmark"
            emptyDescription="Bookmark giúp bạn quay lại khóa học nhanh hơn."
          />
        </section>
      )}
    </AppShell>
  );
}

export function LearnerHomePage({
  initialTab = 'home',
}: {
  initialTab?: string;
}) {
  return (
    <AuthGate allowedRoles={['learner', 'instructor', 'admin']}>
      {(viewer) => (
        <LearnerHomeContent initialTab={initialTab} viewer={viewer} />
      )}
    </AuthGate>
  );
}

function LearnerCourseContent({
  viewer,
  courseId,
}: {
  viewer: Viewer;
  courseId: string;
}) {
  const { state, reload } = useCourseDetail(courseId);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const refreshBookmarks = useCallback(() => {
    getMyBookmarkedCourses({
      client: apiClient,
      query: { limit: 100, page: 1 },
      throwOnError: true,
    })
      .then(({ data }) =>
        setBookmarkedIds(
          new Set(
            data.data
              .map((course) => course.id)
              .filter((id): id is string => Boolean(id))
          )
        )
      )
      .catch(() => setBookmarkedIds(new Set()));
  }, []);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const bookmarked = bookmarkedIds.has(courseId);

  async function runAction(name: string, action: () => Promise<unknown>, success: string) {
    setBusyAction(name);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage(success);
      refreshBookmarks();
      reload();
      return true;
    } catch (error) {
      setActionError(normalizeApiError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Chi tiết"
      title="Nội dung khóa học"

    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <CourseHero
            course={state.data}
            actions={
              <div className="grid gap-2">
                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className="
                        w-full bg-white text-slate-950
                        hover:bg-slate-100
                      "
                    >
                      <Star className="size-4" />
                      Review course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Review course</DialogTitle>
                      <DialogDescription>
                        Share your thoughts about this course with others.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      className="grid gap-4 py-4"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const ok = await runAction(
                          'review',
                          () =>
                            reviewCourse({
                              body: {
                                rating: Number.parseInt(rating, 10),
                                comment,
                              },
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            }),
                          'Cảm ơn bạn đã đánh giá khóa học!'
                        );
                        if (ok) {
                          setReviewOpen(false);
                          setComment('');
                        }
                      }}
                    >
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Rating (1-5)</label>
                        <Input
                          min={1}
                          max={5}
                          type="number"
                          value={rating}
                          onChange={(event) => setRating(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Your comment</label>
                        <textarea
                          className="
                            min-h-24 w-full rounded-lg border border-input
                            bg-transparent px-3 py-2 text-sm transition-colors
                            outline-none
                            placeholder:text-muted-foreground
                            focus-visible:border-ring focus-visible:ring-3
                            focus-visible:ring-ring/50
                          "
                          placeholder="Bạn học được gì từ khóa học này?"
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={busyAction === 'review' || !comment.trim()}
                      >
                        <Save className="size-4" />
                        Submit review
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  disabled={busyAction === 'bookmark'}
                  className="
                    w-full border-white/20 text-white
                    hover:bg-white/10 hover:text-white
                  "
                  onClick={() =>
                    runAction(
                      'bookmark',
                      () =>
                        bookmarked
                          ? unbookmarkCourse({
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            })
                          : bookmarkCourse({
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            }),
                      bookmarked ? 'Đã bỏ lưu khóa học.' : 'Đã lưu khóa học.'
                    )
                  }
                >
                  <Bookmark className="size-4" />
                  {bookmarked ? 'Unbookmark' : 'Bookmark'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyAction === 'finish'}
                  className="
                    w-full border-white/20 text-white
                    hover:bg-white/10 hover:text-white
                  "
                  onClick={() =>
                    runAction(
                      'finish',
                      () =>
                        finishCourse({
                          client: apiClient,
                          path: { courseId },
                          throwOnError: true,
                        }),
                      'Chúc mừng! Bạn đã hoàn thành khóa học.'
                    )
                  }
                >
                  <CheckCircle2 className="size-4" />
                  Mark finished
                </Button>
              </div>
            }
          />

          {actionMessage && (
            <InlineNotice title="Success" description={actionMessage} />
          )}
          {actionError && <ErrorState error={actionError} />}

          <section
            className="grid gap-6"
          >
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">Ná»™i dung khÃ³a há»c</h2>
              <CourseStructure course={state.data} />
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

export function LearnerCoursePage({ courseId }: { courseId: string }) {
  return (
    <AuthGate allowedRoles={['learner', 'instructor', 'admin']}>
      {(viewer) => <LearnerCourseContent viewer={viewer} courseId={courseId} />}
    </AuthGate>
  );
}

async function uploadIntroVideoOnly(
  file: File,
  onProgress?: UploadProgressCallback
) {
  // Introduction video on course creation doesn't have courseId yet
  // We use a dummy ID or the API needs to handle it.
  // Looking at the API, getUploadVideoUrl requires courseId in path.
  // However, for creation, we might need a different endpoint or a convention.
  // Let's use a temporary constant for courseId if it's required by the client but not the server.

  const { data } = await getUploadVideoUrl({
    body: { videoFilename: file.name },
    client: apiClient,
    path: { courseId: 'new' }, // 'new' or any string if the server doesn't use it for path routing but the client requires it
    throwOnError: true,
  });

  await putFileToSignedUrl(data.uploadUrl, file, onProgress);
  return data;
}

function InstructorCoursesContent({
  initialTab,
  viewer,
}: {
  initialTab: string;
  viewer: Viewer;
}) {
  const router = useRouter();
  const activeTab = normalizeTab(initialTab, [
    'courses',
    'drafts',
    'lessons',
    'uploads',
    'reviews',
  ]);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const courses = useCourseList(
    () =>
      getMyCourses({
        client: apiClient,
        query: { limit: 24, page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );

  const displayedCourses = useMemo<ResourceState<CourseListResponse>>(() => {
    if (courses.state.status !== 'ready') {
      return courses.state;
    }

    if (activeTab !== 'drafts') {
      return courses.state;
    }

    return {
      status: 'ready',
      data: {
        ...courses.state.data,
        data: courses.state.data.data.filter(isDraftLike),
      },
    };
  }, [activeTab, courses.state]);

  async function create(body: CourseCourseWritable) {
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const response = await createCourse({
        body,
        client: apiClient,
        throwOnError: true,
      });
      courses.reload();
      const location = response.response.headers.get('Content-Location');
      const courseId = location?.split('/').filter(Boolean).at(-1);
      if (courseId) {
        setCreateOpen(false);
        router.push(`/instructor/courses/${courseId}`);
      }
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function mutateCourse(action: () => Promise<unknown>, success: string) {
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage(success);
      courses.reload();
    } catch (error) {
      setActionError(normalizeApiError(error));
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Giảng dạy"
      title="Quản lý khóa học"
      actions={
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <FilePlus2 className="size-4" />
              Create course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create course</DialogTitle>
              <DialogDescription>
                Fill in basic info now. An introduction video is required.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto px-1 pb-4">
              <CourseForm
                submitLabel="Create course"
                submitting={submitting}
                error={actionError?.message}
                forceIntroductionVideoKey={true}
                onUploadIntroductionVideo={uploadIntroVideoOnly}
                onSubmit={create}
              />
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div
        className="grid gap-4"
      >
        <div className="grid gap-4">
          {actionMessage && (
            <InlineNotice title="Success" description={actionMessage} />
          )}
          {actionError && <ErrorState error={actionError} />}
          <ListContent
            state={displayedCourses}
            reload={courses.reload}
            destination="instructor"
            emptyTitle={
              activeTab === 'drafts'
                ? 'Chưa có bản nháp'
                : 'Chưa có khóa học của bạn'
            }
            emptyDescription={
              activeTab === 'drafts'
                ? 'Nhấn edit trong chi tiết khóa học đã duyệt để tạo bản nháp.'
                : 'Tạo khóa học đầu tiên bằng nút Create course.'
            }
            actionFor={(course) => (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href={`/instructor/courses/${course.id}`}>
                    <Eye className="size-4" />
                    Manage
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    mutateCourse(
                      course.hidden ? 'unhide' : 'hide',
                      () =>
                        course.hidden
                          ? unhideCourse({
                              client: apiClient,
                              path: { courseId: course.id ?? '' },
                              throwOnError: true,
                            })
                          : hideCourse({
                              client: apiClient,
                              path: { courseId: course.id ?? '' },
                              throwOnError: true,
                            }),
                      course.hidden ? 'Khóa học đã hiện.' : 'Khóa học đã ẩn.'
                    )
                  }
                >
                  {course.hidden ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                  {course.hidden ? 'Unhide' : 'Hide'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    mutateCourse(
                      'delete',
                      () =>
                        deleteCourse({
                          client: apiClient,
                          path: { courseId: course.id ?? '' },
                          throwOnError: true,
                        }),
                      'Khóa học đã được xóa.'
                    )
                  }
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            )}
          />
        </div>
      </div>
    </AppShell>
  );
}

export function InstructorCoursesPage({
  initialTab = 'courses',
}: {
  initialTab?: string;
}) {
  return (
    <AuthGate allowedRoles={['instructor', 'admin']}>
      {(viewer) => (
        <InstructorCoursesContent initialTab={initialTab} viewer={viewer} />
      )}
    </AuthGate>
  );
}

function InstructorCourseDetailContent({
  viewer,
  courseId,
}: {
  viewer: Viewer;
  courseId: string;
}) {
  const router = useRouter();
  const { state, reload } = useCourseDetail(courseId);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage(success);
      reload();
      return true;
    } catch (error) {
      setActionError(normalizeApiError(error));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function ensureEditableCourseId() {
    if (state.status !== 'ready') {
      throw new Error('Course detail is not loaded yet.');
    }

    if (isDraftLike(state.data)) {
      return state.data.id ?? courseId;
    }

    let createDraftError: unknown;

    try {
      await createDraftVersion({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
      });
    } catch (error) {
      createDraftError = error;
    }

    try {
      const { data } = await getCourseForUpdate({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
      });
      return data.data.id ?? courseId;
    } catch (error) {
      throw createDraftError ?? error;
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Quản lý"
      title="Chi tiết khóa học"

    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <CourseHero
            course={state.data}
            actions={
              <div className="grid gap-2">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={submitting}
                      className="
                        w-full bg-white text-slate-950
                        hover:bg-slate-100
                      "
                    >
                      <Pencil className="size-4" />
                      Edit course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Edit basic info</DialogTitle>
                      <DialogDescription>
                        Update title, price, or overview. Changing these on a published course will create a new draft.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto px-1 pb-4">
                      <CourseForm
                        course={state.data}
                        submitLabel="Save changes"
                        submitting={submitting}
                        onUploadIntroductionVideo={(file, onProgress) =>
                          uploadCourseVideo(courseId, file, onProgress)
                        }
                        onSubmit={async (body) => {
                          if (state.status !== 'ready') return;
                          
                          // Optimistic Update: Save current state for rollback
                          const previousState = state.data;
                          
                          // Update local state immediately
                          setState({
                            status: 'ready',
                            data: {
                              ...previousState,
                              title: body.title,
                              price: body.price,
                              overview: body.overview,
                            }
                          });

                          let editableCourseId = courseId;
                          const ok = await runAction(
                            async () => {
                              editableCourseId = await ensureEditableCourseId();
                              await updateCourse({
                                body,
                                client: apiClient,
                                path: { courseId: editableCourseId },
                                throwOnError: true,
                              });
                            },
                            isDraftLike(previousState)
                              ? 'Khóa học đã được cập nhật.'
                              : 'Bản nháp mới đã được tạo và cập nhật.'
                          );

                          if (ok) {
                            setEditOpen(false);
                            if (editableCourseId !== courseId) {
                              router.replace(`/instructor/courses/${editableCourseId}`);
                            }
                          } else {
                            // Rollback on failure
                            setState({ status: 'ready', data: previousState });
                          }
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  className="
                    w-full border-white/20 text-white
                    hover:bg-white/10 hover:text-white
                  "
                  onClick={() =>
                    runAction(
                      () =>
                        state.data.hidden
                          ? unhideCourse({
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            })
                          : hideCourse({
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            }),
                      state.data.hidden
                        ? 'Khóa học đã hiện.'
                        : 'Khóa học đã ẩn.'
                    )
                  }
                >
                  {state.data.hidden ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                  {state.data.hidden ? 'Unhide course' : 'Hide course'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={submitting}
                  className="
                    w-full border-red-500 bg-red-600 text-white
                    hover:bg-red-700 hover:text-white
                  "
                  onClick={() =>
                    runAction(
                      () =>
                        deleteCourse({
                          client: apiClient,
                          path: { courseId },
                          throwOnError: true,
                        }),
                      'Khóa học đã được xóa.'
                    ).then((ok) => {
                      if (ok) {
                        router.push('/instructor/courses');
                      }
                    })
                  }
                >
                  <Trash2 className="size-4" />
                  Delete course
                </Button>
              </div>
            }
          />

          {actionMessage && (
            <InlineNotice title="Success" description={actionMessage} />
          )}
          {actionError && <ErrorState error={actionError} />}

          <div
            className="
              grid gap-6
              xl:grid-cols-[1fr_340px]
            "
          >
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">Course structure</h2>
              <CourseStructure course={state.data} />
              <InlineNotice
                title="Sắp ra mắt"
                description="Tính năng thêm Section và Lesson đang được hoàn thiện."
              />
            </div>

            <div className="grid gap-4">
              <Card className="bg-white text-slate-600">
                <CardHeader>
                  <CardTitle className="text-slate-900">Ghi chú</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>
                    Nhấn <strong>Edit course</strong> để thay đổi thông tin cơ bản.
                  </p>
                  <InlineNotice
                    title="Storage"
                    description="Video được upload trực tiếp lên hệ thống lưu trữ RustFS qua link bảo mật."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export function InstructorCourseDetailPage({ courseId }: { courseId: string }) {
  return (
    <AuthGate allowedRoles={['instructor', 'admin']}>
      {(viewer) => (
        <InstructorCourseDetailContent viewer={viewer} courseId={courseId} />
      )}
    </AuthGate>
  );
}

function AdminCoursesContent({
  initialTab,
  viewer,
}: {
  initialTab: string;
  viewer: Viewer;
}) {
  const activeTab = normalizeTab(initialTab, [
    'system',
    'pending',
    'archive',
    'stats',
  ]);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const courses = useCourseList(
    () =>
      getSystemCourses({
        client: apiClient,
        query: {
          limit: 30,
          page: 1,
          query: submittedQuery || undefined,
        },
        throwOnError: true,
      }).then(({ data }) => data),
    [submittedQuery]
  );

  const rows = useMemo(
    () => {
      if (courses.state.status !== 'ready') {
        return [];
      }

      if (activeTab === 'pending') {
        return courses.state.data.data.filter(isPendingLike);
      }

      return courses.state.data.data;
    },
    [activeTab, courses.state]
  );

  async function mutateAdminCourse(action: () => Promise<unknown>, success: string) {
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage(success);
      courses.reload();
    } catch (error) {
      setActionError(normalizeApiError(error));
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Quản trị"
      title="Quản lý khóa học hệ thống"
      actions={
        <Button type="button" variant="outline" onClick={courses.reload}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      }
    >
      <RoleTabs
        active={activeTab}
        tabs={[
          {
                        href: '/admin/courses',
            icon: ShieldCheck,
            label: 'System courses',
            value: 'system',
          },
          {
                        href: '/admin/courses?tab=pending',
            icon: Clock3,
            label: 'Pending',
            value: 'pending',
          },
          {
                        href: '/admin/courses?tab=archive',
            icon: Layers3,
            label: 'Hidden/deleted',
            value: 'archive',
          },
          {
                        href: '/admin/courses?tab=stats',
            icon: BarChart3,
            label: 'Stats',
            value: 'stats',
          },
        ]}
      />

      {actionMessage && (
        <InlineNotice title="Success" description={actionMessage} />
      )}

      {activeTab === 'archive' && (
        <MockPanel
          title="Hidden/deleted view"
          description="Mock view vi BE hien chua co archive pagination rieng."
          items={[
            'Hidden courses summary.',
            'Deleted courses audit trail.',
            'Restore flow placeholder.',
          ]}
        />
      )}

      {activeTab === 'stats' && (
        <MockPanel
          title="System stats"
          items={[
            `Courses loaded this page: ${rows.length}`,
            'Pending approvals trend: coming soon.',
            'Revenue/course analytics: coming soon.',
          ]}
        />
      )}

      {(activeTab === 'system' || activeTab === 'pending') && (
      <>
      <Card className="bg-white">
        <CardContent
          className="
            flex flex-col gap-3 py-4
            md:flex-row
          "
        >
          <Input
            placeholder="Search system courses"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setSubmittedQuery(query.trim());
              }
            }}
          />
          <Button type="button" onClick={() => setSubmittedQuery(query.trim())}>
            <Search className="size-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      {courses.state.status === 'loading' && <CourseGridSkeleton />}
      {courses.state.status === 'error' && (
        <ErrorState error={courses.state.error} onRetry={courses.reload} />
      )}
      {actionError && <ErrorState error={actionError} />}
      {courses.state.status === 'ready' && !rows.length && (
        <EmptyState
          title="Chưa có khóa học nào"
          description="Chưa có dữ liệu khóa học trong hệ thống."
        />
      )}
      {courses.state.status === 'ready' && rows.length > 0 && (
        <Card className="bg-white">
          <CardContent className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hidden</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((course) => (
                  <TableRow key={course.id ?? course.title}>
                    <TableCell className="max-w-80 whitespace-normal">
                      <div className="font-medium">{course.title}</div>
                      <div className="line-clamp-1 text-xs text-slate-500">
                        {course.overview || 'No overview'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          course.status === 'approved' ? 'default' : 'secondary'
                        }
                      >
                        {course.status ?? 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.hidden ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{formatVnd(course.price)}</TableCell>
                    <TableCell>{course.instructorId ?? 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/instructor/courses/${course.id}`}>
                            <Eye className="size-4" />
                            Detail
                          </Link>
                        </Button>
                        {isPendingLike(course) && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                mutateAdminCourse(
                                  'approve',
                                  () =>
                                    approveCourse({
                                      client: apiClient,
                                      path: { courseId: course.id ?? '' },
                                      throwOnError: true,
                                    }),
                                  'Khóa học đã được duyệt.'
                                )
                              }
                            >
                              <CheckCircle2 className="size-4" />
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                mutateAdminCourse(
                                  'decline',
                                  () =>
                                    declineCourse({
                                      client: apiClient,
                                      path: { courseId: course.id ?? '' },
                                      throwOnError: true,
                                    }),
                                  'Đã từ chối khóa học.'
                                )
                              }
                            >
                              <XCircle className="size-4" />
                              Decline
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            mutateAdminCourse(
                              course.hidden ? 'unhide' : 'hide',
                              () =>
                                course.hidden
                                  ? unhideCourse({
                                      client: apiClient,
                                      path: { courseId: course.id ?? '' },
                                      throwOnError: true,
                                    })
                                  : hideCourse({
                                      client: apiClient,
                                      path: { courseId: course.id ?? '' },
                                      throwOnError: true,
                                    }),
                              course.hidden ? 'Khóa học đã hiện.' : 'Khóa học đã ẩn.'
                            )
                          }
                        >
                          {course.hidden ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeOff className="size-4" />
                          )}
                          {course.hidden ? 'Unhide' : 'Hide'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            mutateAdminCourse(
                              'delete',
                              () =>
                                deleteCourse({
                                  client: apiClient,
                                  path: { courseId: course.id ?? '' },
                                  throwOnError: true,
                                }),
                              'Khóa học đã được xóa.'
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </>
      )}
    </AppShell>
  );
}

export function AdminCoursesPage({
  initialTab = 'system',
}: {
  initialTab?: string;
}) {
  return (
    <AuthGate allowedRoles={['admin']}>
      {(viewer) => (
        <AdminCoursesContent initialTab={initialTab} viewer={viewer} />
      )}
    </AuthGate>
  );
}

export function DashboardRedirectPage() {
  const router = useRouter();
  const { viewer, loading } = useViewer();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!viewer?.id && !viewer?.accessToken) {
      router.replace('/login');
      return;
    }
    if (viewer?.roles.includes('admin')) {
      router.replace('/admin/courses');
      return;
    }
    if (viewer?.roles.includes('instructor')) {
      router.replace('/instructor/courses');
      return;
    }
    router.replace('/courses');
  }, [loading, router, viewer]);

  return (
    <AppShell
      viewer={viewer}
      eyebrow=""
      title="Đang chuyển hướng..."

    >
      <CourseGridSkeleton />
    </AppShell>
  );
}
