'use client';

import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Eye,
  EyeOff,
  FilePlus2,
  Filter,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UploadCloud,
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
  type CourseCourseWritable,
  type GetUploadVideoUrlResponse,
  bookmarkCourse,
  createCourse,
  deleteCourse,
  finishCourse,
  getCourseDetail,
  getCourseLandingPage,
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
import type { Viewer } from '#/lib/auth/roles';
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

  return { state, reload };
}

function ResultMeta({ result }: { result: CourseListResponse }) {
  return (
    <div className="text-sm text-slate-500">
      {result.pagination.total} courses · page {result.pagination.page}/
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

export function MarketplacePage() {
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
      eyebrow="Marketplace"
      title="Khám phá khóa học"
      description="Browse các course đã được publish. Public page không yêu cầu login; khi cần học tiếp hoặc bookmark, user sẽ sign in."
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
              placeholder="Tìm course theo title hoặc overview"
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
        emptyTitle="Chưa có course published"
        emptyDescription="Course service đang chạy nhưng chưa có dữ liệu public. Chạy seedcourse nếu muốn có dữ liệu mẫu."
      />
    </AppShell>
  );
}

export function PublicCoursePage({ courseId }: { courseId: string }) {
  const { viewer } = useViewer();
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
      eyebrow="Course landing"
      title="Course overview"
      description="Public landing data từ endpoint published course."
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && <ErrorState error={state.error} />}
      {state.status === 'ready' && (
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
                <Link href={`/learn/courses/${courseId}`}>
                  <BookOpen className="size-4" />
                  Vào lớp học
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
      )}
    </AppShell>
  );
}

function LearnerHomeContent({ viewer }: { viewer: Viewer }) {
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
      eyebrow="Learner"
      title="Không gian học tập"
      description="Theo dõi enrolled courses và bookmark. Các action vẫn do backend kiểm tra quyền."
      actions={
        <Button asChild>
          <Link href="/courses">
            <Search className="size-4" />
            Browse courses
          </Link>
        </Button>
      }
    >
      <section className="grid gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Đang học</h2>
          <ListContent
            state={enrolled.state}
            reload={enrolled.reload}
            destination="learner"
            emptyTitle="Bạn chưa enrolled course nào"
            emptyDescription="Vào marketplace để xem các khóa học đang mở."
          />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Bookmarked</h2>
          <ListContent
            state={bookmarked.state}
            reload={bookmarked.reload}
            destination="learner"
            emptyTitle="Chưa có bookmark"
            emptyDescription="Bookmark giúp bạn quay lại course nhanh hơn."
          />
        </div>
      </section>
    </AppShell>
  );
}

export function LearnerHomePage() {
  return (
    <AuthGate allowedRoles={['learner']}>
      {(viewer) => <LearnerHomeContent viewer={viewer} />}
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

  async function runAction(name: string, action: () => Promise<unknown>) {
    setBusyAction(name);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage('Done. Dữ liệu đã được gửi tới backend.');
      refreshBookmarks();
      reload();
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Learner detail"
      title="Course workspace"
      description="Learner route dùng course detail endpoint chung, chỉ khác action được render."
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
                <Button
                  type="button"
                  disabled={busyAction === 'bookmark'}
                  className="
                    w-full bg-white text-slate-950
                    hover:bg-slate-100
                  "
                  onClick={() =>
                    runAction('bookmark', () =>
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
                          })
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
                    runAction('finish', () =>
                      finishCourse({
                        client: apiClient,
                        path: { courseId },
                        throwOnError: true,
                      })
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
            className="
            grid gap-6
            lg:grid-cols-[1fr_340px]
          "
          >
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">Nội dung khóa học</h2>
              <CourseStructure course={state.data} />
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Review course</CardTitle>
                <CardDescription>
                  Gửi rating/comment qua endpoint reviewCourse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    runAction('review', () =>
                      reviewCourse({
                        body: {
                          rating: Number.parseInt(rating, 10),
                          comment,
                        },
                        client: apiClient,
                        path: { courseId },
                        throwOnError: true,
                      })
                    );
                  }}
                >
                  <Input
                    min={1}
                    max={5}
                    type="number"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                  />
                  <textarea
                    className="
                      min-h-24 w-full rounded-lg border border-input
                      bg-transparent px-3 py-2 text-sm transition-colors
                      outline-none
                      placeholder:text-muted-foreground
                      focus-visible:border-ring focus-visible:ring-3
                      focus-visible:ring-ring/50
                    "
                    placeholder="Bạn học được gì từ course này?"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={busyAction === 'review' || !comment.trim()}
                  >
                    <Save className="size-4" />
                    Submit review
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </AppShell>
  );
}

export function LearnerCoursePage({ courseId }: { courseId: string }) {
  return (
    <AuthGate allowedRoles={['learner']}>
      {(viewer) => <LearnerCourseContent viewer={viewer} courseId={courseId} />}
    </AuthGate>
  );
}

function InstructorCoursesContent({ viewer }: { viewer: Viewer }) {
  const router = useRouter();
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const courses = useCourseList(
    () =>
      getMyCourses({
        client: apiClient,
        query: { limit: 24, page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );

  async function create(body: CourseCourseWritable) {
    setSubmitting(true);
    setActionError(null);
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
        router.push(`/instructor/courses/${courseId}`);
      }
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function mutateCourse(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      courses.reload();
    } catch (error) {
      setActionError(normalizeApiError(error));
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Instructor"
      title="Teaching console"
      description="Quản lý course qua các endpoint đã có logic: list, create, update, hide/unhide, delete, upload URL."
    >
      <div
        className="
        grid gap-6
        xl:grid-cols-[360px_1fr]
      "
      >
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus2 className="size-5" />
              Tạo course
            </CardTitle>
            <CardDescription>
              Form luôn gửi introduction video key để tránh lỗi backend hiện
              tại.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseForm
              forceIntroductionVideoKey
              submitLabel="Create course"
              submitting={submitting}
              error={actionError?.message}
              onSubmit={create}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {actionError && <ErrorState error={actionError} />}
          <ListContent
            state={courses.state}
            reload={courses.reload}
            destination="instructor"
            emptyTitle="Chưa có course của bạn"
            emptyDescription="Tạo course đầu tiên bằng form bên trái."
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
                    mutateCourse(() =>
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
                          })
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
                    mutateCourse(() =>
                      deleteCourse({
                        client: apiClient,
                        path: { courseId: course.id ?? '' },
                        throwOnError: true,
                      })
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

export function InstructorCoursesPage() {
  return (
    <AuthGate allowedRoles={['instructor', 'admin']}>
      {(viewer) => <InstructorCoursesContent viewer={viewer} />}
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
  const [videoFilename, setVideoFilename] = useState('');
  const [uploadResult, setUploadResult] =
    useState<GetUploadVideoUrlResponse | null>(null);

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

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Instructor detail"
      title="Course management"
      description="Detail route gọi cùng endpoint course detail, nhưng render management controls cho instructor/admin."
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
                <Button
                  type="button"
                  disabled={submitting}
                  className="
                    w-full bg-white text-slate-950
                    hover:bg-slate-100
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
                        ? 'Course đã unhide.'
                        : 'Course đã hide.'
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
                  variant="outline"
                  disabled={submitting}
                  className="
                    w-full border-white/20 text-white
                    hover:bg-white/10 hover:text-white
                  "
                  onClick={() =>
                    runAction(
                      () =>
                        deleteCourse({
                          client: apiClient,
                          path: { courseId },
                          throwOnError: true,
                        }),
                      'Course đã delete.'
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
            xl:grid-cols-[360px_1fr]
          "
          >
            <div className="grid gap-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Edit basic info</CardTitle>
                  <CardDescription>
                    Gọi `updateCourse`, không đụng section/lesson mutation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CourseForm
                    course={state.data}
                    submitLabel="Save changes"
                    submitting={submitting}
                    onSubmit={async (body) => {
                      await runAction(
                        () =>
                          updateCourse({
                            body,
                            client: apiClient,
                            path: { courseId },
                            throwOnError: true,
                          }),
                        'Course đã update.'
                      );
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Upload video URL</CardTitle>
                  <CardDescription>
                    Tạo signed URL và copy videoKey vào form khi cần.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    className="grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!videoFilename.trim()) {
                        return;
                      }
                      setSubmitting(true);
                      setActionError(null);
                      getUploadVideoUrl({
                        body: { videoFilename: videoFilename.trim() },
                        client: apiClient,
                        path: { courseId },
                        throwOnError: true,
                      })
                        .then(({ data }) => setUploadResult(data))
                        .catch((error) =>
                          setActionError(normalizeApiError(error))
                        )
                        .finally(() => setSubmitting(false));
                    }}
                  >
                    <Input
                      placeholder="intro.mp4"
                      value={videoFilename}
                      onChange={(event) => setVideoFilename(event.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={submitting || !videoFilename.trim()}
                    >
                      <UploadCloud className="size-4" />
                      Generate URL
                    </Button>
                  </form>
                  {uploadResult && (
                    <div
                      className="
                      mt-4 grid gap-2 rounded-lg bg-slate-50 p-3 text-xs
                    "
                    >
                      <div>
                        <span className="font-medium">videoKey:</span>{' '}
                        <span className="break-all">
                          {uploadResult.videoKey}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">expiresAt:</span>{' '}
                        {formatDateTime(uploadResult.expiresAt)}
                      </div>
                      <div>
                        <span className="font-medium">uploadUrl:</span>{' '}
                        <span className="break-all">
                          {uploadResult.uploadUrl}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">Course structure</h2>
              <CourseStructure course={state.data} />
              <InlineNotice
                title="Section/Lesson editing tạm khóa"
                description="Các endpoint create/edit/delete section/lesson hiện chưa usable hoặc đang panic/501, nên UI V1 chỉ hiển thị structure."
              />
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

function AdminCoursesContent({ viewer }: { viewer: Viewer }) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
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
    () => (courses.state.status === 'ready' ? courses.state.data.data : []),
    [courses.state]
  );

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Admin"
      title="System courses"
      description="Admin route chỉ dùng endpoint hiện usable. Approve/decline/analytics chưa render vì backend chưa triển khai."
      actions={
        <Button type="button" variant="outline" onClick={courses.reload}>
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
      {courses.state.status === 'ready' && !rows.length && (
        <EmptyState
          title="System chưa có course"
          description="Chưa có dữ liệu course trong database."
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
                    <TableCell className="text-right">
                      <Button asChild variant="outline">
                        <Link href={`/instructor/courses/${course.id}`}>
                          <Eye className="size-4" />
                          Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

export function AdminCoursesPage() {
  return (
    <AuthGate allowedRoles={['admin']}>
      {(viewer) => <AdminCoursesContent viewer={viewer} />}
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
      eyebrow="Routing"
      title="Đang đưa bạn tới đúng workspace"
      description="Dashboard sẽ chọn route theo role trong Authentik token."
    >
      <CourseGridSkeleton />
    </AppShell>
  );
}
