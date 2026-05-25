'use client';

import {
  ArrowLeft,
  Award,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  type LucideIcon,
  MessageSquareText,
  PlayCircle,
  RefreshCw,
  Save,
  Search,
  Send,
  Star,
  Trophy,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import {
  type DependencyList,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import { Input } from '#/components/ui/neumorphism/input';
import { Progress } from '#/components/ui/neumorphism/progress';
import { useToast } from '#/components/ui/neumorphism/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/shadcn/dialog';
import { apiClient } from '#/lib/api';
import {
  type CourseCertificate,
  type CourseCourse,
  type CourseCourseDetail,
  type CourseLessonComment,
  type CourseLessonDetail,
  type CoursePagination,
  bookmarkCourse,
  commentOnLesson,
  finishCourse,
  getLessonComments,
  getLessonDetail,
  getMyBookmarkedCourses,
  getMyCertificates,
  getMyEnrolledCourses,
  markLessonAsCompleted,
  reviewCourse,
  saveVideoLessonProgress,
  unbookmarkCourse,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatDateTime, formatDuration } from '#/lib/api/format';
import type { Viewer } from '#/lib/auth/roles';

import { CourseHero, CourseStructure } from './course-detail';
import {
  type CourseListResponse,
  CourseReviewsPanel,
  ListContent,
  type ResourceState,
  RoleTabs,
  normalizeTab,
  useCourseDetail,
  useCourseList,
  useCourseReviews,
} from './course-shared';
import {
  CourseGridSkeleton,
  EmptyState,
  ErrorState,
  InlineNotice,
} from './course-states';
import { CourseVideoPlayer } from './course-video-player';

type CertificateListResponse = {
  data: CourseCertificate[];
  pagination: CoursePagination;
};

type LessonCommentResponse = {
  data: CourseLessonComment[];
};

type FlatLesson = {
  href: string;
  lessonId: string;
  lessonNumber: number;
  sectionId: string;
  sectionTitle: string;
  title: string;
};

function useLearnerResource<T>(loader: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ResourceState<T>>({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { state, reload };
}

function readyCount<
  T extends { data: unknown[]; pagination: { total: number } },
>(state: ResourceState<T>) {
  return state.status === 'ready' ? state.data.pagination.total : null;
}

function displayCount(value: number | null) {
  return value === null ? '...' : value.toString();
}

function flattenLessons(course: CourseCourseDetail, courseId: string) {
  return course.sections
    .flatMap((section) =>
      section.lessons.map((lesson, lessonIndex) => ({
        href: `/learn/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}`,
        lessonId: lesson.id ?? '',
        lessonNumber: lessonIndex + 1,
        sectionId: section.id,
        sectionTitle: section.title,
        title: lesson.title,
      }))
    )
    .filter((lesson) => lesson.lessonId);
}

function firstLessonHref(course: CourseCourseDetail, courseId: string) {
  return flattenLessons(course, courseId)[0]?.href ?? null;
}

function totalLessons(course: CourseCourseDetail) {
  return course.sections.reduce(
    (total, section) => total + section.lessons.length,
    0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function apiDate(value = new Date()) {
  return value.toISOString() as unknown as Date;
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="bg-nm-bg shadow-nm-flat">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="
            flex size-12 shrink-0 items-center justify-center rounded-2xl
            bg-nm-bg text-primary shadow-nm-inset
          "
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-1 text-2xl font-semibold text-slate-950">
            {value}
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LearnerSummary({
  bookmarked,
  certificates,
  enrolled,
}: {
  bookmarked: ResourceState<CourseListResponse>;
  certificates: ResourceState<CertificateListResponse>;
  enrolled: ResourceState<CourseListResponse>;
}) {
  return (
    <div
      className="
        grid gap-4
        md:grid-cols-3
      "
    >
      <StatCard
        helper="Courses ready to continue"
        icon={BookOpenCheck}
        label="Enrolled"
        value={displayCount(readyCount(enrolled))}
      />
      <StatCard
        helper="Saved from the catalog"
        icon={Bookmark}
        label="Saved"
        value={displayCount(readyCount(bookmarked))}
      />
      <StatCard
        helper="Issued after completion"
        icon={Award}
        label="Certificates"
        value={displayCount(readyCount(certificates))}
      />
    </div>
  );
}

function ContinueLearningCard({ course }: { course?: CourseCourse }) {
  const href = course?.id ? `/learn/courses/${course.id}` : '/courses';

  return (
    <Card className="bg-nm-bg shadow-nm-flat">
      <CardContent
        className="
          grid gap-5 p-5
          lg:grid-cols-[1fr_auto] lg:items-center
        "
      >
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="inset">
              <Trophy className="size-3" />
              Learning hub
            </Badge>
            {course?.status && <Badge>{course.status}</Badge>}
          </div>
          <h2 className="text-xl font-semibold text-slate-950">
            {course?.title ?? 'Build your next learning streak'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm/6 text-slate-600">
            {course?.overview ||
              'Pick a course from the catalog, save it, and continue from your learner workspace.'}
          </p>
        </div>
        <div
          className="
            flex flex-col gap-2
            sm:flex-row
            lg:flex-col
          "
        >
          <Button asChild>
            <Link href={href}>
              <PlayCircle className="mr-2 size-4" />
              {course ? 'Continue' : 'Explore courses'}
            </Link>
          </Button>
          {course && (
            <Button asChild variant="outline">
              <Link href="/courses">
                <Search className="mr-2 size-4" />
                Explore more
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CertificateList({
  reload,
  state,
}: {
  reload: () => void;
  state: ResourceState<CertificateListResponse>;
}) {
  if (state.status === 'loading') {
    return <CourseGridSkeleton />;
  }

  if (state.status === 'error') {
    return <ErrorState error={state.error} onRetry={reload} />;
  }

  if (!state.data.data.length) {
    return (
      <EmptyState
        title="No certificates yet"
        description="Finished courses will appear here after the backend issues certificates."
      />
    );
  }

  return (
    <Card className="bg-nm-bg shadow-nm-flat">
      <CardHeader>
        <CardTitle>Certificates</CardTitle>
        <CardDescription>
          {state.data.pagination.total} certificates issued to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {state.data.data.map((certificate) => (
          <div
            key={certificate.id}
            className="
              flex flex-col gap-3 rounded-2xl bg-nm-bg p-4 shadow-nm-inset
              md:flex-row md:items-center md:justify-between
            "
          >
            <div className="min-w-0">
              <div
                className="flex items-center gap-2 font-semibold text-slate-900"
              >
                <Award className="size-4 text-primary" />
                Certificate {certificate.id.slice(0, 8)}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Course {certificate.courseId}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Issued {formatDateTime(certificate.createdAt)}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/learn/courses/${certificate.courseId}`}>
                <BookOpen className="mr-2 size-4" />
                View course
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
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
    'certificates',
  ]);
  const enrolled = useCourseList(
    () =>
      getMyEnrolledCourses({
        client: apiClient,
        query: { limit: 12, order: 'desc', page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );
  const bookmarked = useCourseList(
    () =>
      getMyBookmarkedCourses({
        client: apiClient,
        query: { limit: 12, order: 'desc', page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );
  const certificates = useLearnerResource(
    () =>
      getMyCertificates({
        client: apiClient,
        query: { limit: 12, order: 'desc', page: 1 },
        throwOnError: true,
      }).then(({ data }) => data),
    []
  );

  const nextCourse =
    enrolled.state.status === 'ready' ? enrolled.state.data.data[0] : undefined;

  return (
    <AppShell
      actions={
        <Button asChild>
          <Link href="/courses">
            <Search className="mr-2 size-4" />
            Explore Courses
          </Link>
        </Button>
      }
      description="Continue enrolled courses, revisit saved courses, and track certificates from one learner workspace."
      eyebrow="Learning"
      title="Learning Workspace"
      viewer={viewer}
    >
      <RoleTabs
        active={activeTab}
        tabs={[
          {
            href: '/learn',
            icon: Home,
            label: 'Overview',
            value: 'home',
          },
          {
            href: '/learn?tab=enrolled',
            icon: BookOpenCheck,
            label: 'Enrolled',
            value: 'enrolled',
          },
          {
            href: '/learn?tab=bookmarked',
            icon: Bookmark,
            label: 'Saved',
            value: 'bookmarked',
          },
          {
            href: '/learn?tab=certificates',
            icon: Award,
            label: 'Certificates',
            value: 'certificates',
          },
        ]}
      />

      {activeTab === 'home' && (
        <section className="grid gap-6">
          <LearnerSummary
            bookmarked={bookmarked.state}
            certificates={certificates.state}
            enrolled={enrolled.state}
          />
          <ContinueLearningCard course={nextCourse} />
          <div className="grid gap-6">
            <section className="grid gap-3">
              <h2 className="text-lg font-semibold">In Progress</h2>
              <ListContent
                destination="learner"
                emptyDescription="Go to explore to see available courses."
                emptyTitle="You have not enrolled in any courses"
                reload={enrolled.reload}
                state={enrolled.state}
              />
            </section>
            <section className="grid gap-3">
              <h2 className="text-lg font-semibold">Saved</h2>
              <ListContent
                destination="learner"
                emptyDescription="Bookmarks help you return to your courses faster."
                emptyTitle="No bookmarks yet"
                reload={bookmarked.reload}
                state={bookmarked.state}
              />
            </section>
          </div>
        </section>
      )}

      {activeTab === 'enrolled' && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Enrolled Courses</h2>
          <ListContent
            destination="learner"
            emptyDescription="Go to explore to see available courses."
            emptyTitle="You have not enrolled in any courses"
            reload={enrolled.reload}
            state={enrolled.state}
          />
        </section>
      )}

      {activeTab === 'bookmarked' && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Saved Courses</h2>
          <ListContent
            destination="learner"
            emptyDescription="Bookmarks help you return to your courses faster."
            emptyTitle="No bookmarks yet"
            reload={bookmarked.reload}
            state={bookmarked.state}
          />
        </section>
      )}

      {activeTab === 'certificates' && (
        <CertificateList
          reload={certificates.reload}
          state={certificates.state}
        />
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
  const { success: showToast } = useToast();
  const { state, reload } = useCourseDetail(courseId);
  const reviews = useCourseReviews(courseId);
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
  const firstLesson =
    state.status === 'ready' ? firstLessonHref(state.data, courseId) : null;
  const lessonCount = state.status === 'ready' ? totalLessons(state.data) : 0;

  async function runAction(
    name: string,
    action: () => Promise<unknown>,
    success: string
  ) {
    setBusyAction(name);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      setActionMessage(success);
      showToast(success);
      refreshBookmarks();
      reviews.reload();
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
      description="Study the course outline, save the course, submit reviews, and continue into individual lessons."
      eyebrow="Learning"
      title="Course Content"
      viewer={viewer}
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <CourseHero
            actions={
              <div className="grid gap-2">
                {firstLesson ? (
                  <Button asChild className="w-full">
                    <Link href={firstLesson}>
                      <PlayCircle className="mr-2 size-4" />
                      Start learning
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" disabled type="button">
                    <PlayCircle className="mr-2 size-4" />
                    No lessons
                  </Button>
                )}

                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                      <Star className="mr-2 size-4" />
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
                                comment,
                                rating: Number.parseInt(rating, 10),
                              },
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            }),
                          'Thank you for reviewing this course.'
                        );
                        if (ok) {
                          setReviewOpen(false);
                          setComment('');
                        }
                      }}
                    >
                      <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="rating">
                          Rating
                        </label>
                        <Input
                          id="rating"
                          max={5}
                          min={1}
                          type="number"
                          value={rating}
                          onChange={(event) => setRating(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium" htmlFor="review">
                          Comment
                        </label>
                        <textarea
                          id="review"
                          className="
                            min-h-24 w-full rounded-xl border-none bg-nm-bg px-4
                            py-2 text-sm shadow-nm-inset transition-colors
                            outline-none
                            placeholder:text-muted-foreground
                            focus-visible:ring-2 focus-visible:ring-ring
                            focus-visible:ring-offset-2
                          "
                          placeholder="What did you learn from this course?"
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                        />
                      </div>
                      <Button
                        disabled={busyAction === 'review' || !comment.trim()}
                        type="submit"
                      >
                        <Save className="mr-2 size-4" />
                        Submit review
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  className="w-full"
                  disabled={busyAction === 'bookmark'}
                  type="button"
                  variant="outline"
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
                      bookmarked
                        ? 'Course removed from bookmarks.'
                        : 'Course saved to bookmarks.'
                    )
                  }
                >
                  <Bookmark className="mr-2 size-4" />
                  {bookmarked ? 'Unbookmark' : 'Bookmark'}
                </Button>
                <Button
                  className="w-full"
                  disabled={busyAction === 'finish'}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    runAction(
                      'finish',
                      () =>
                        finishCourse({
                          client: apiClient,
                          path: { courseId },
                          throwOnError: true,
                        }),
                      'Course completion request submitted.'
                    )
                  }
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Mark finished
                </Button>
              </div>
            }
            course={state.data}
          />

          <div
            className="
              grid gap-4
              md:grid-cols-3
            "
          >
            <StatCard
              helper="Available modules"
              icon={ClipboardList}
              label="Sections"
              value={state.data.sections.length.toString()}
            />
            <StatCard
              helper="Lessons in this course"
              icon={PlayCircle}
              label="Lessons"
              value={lessonCount.toString()}
            />
            <StatCard
              helper="Use lesson pages to save progress"
              icon={BookOpenCheck}
              label="Workspace"
              value="Ready"
            />
          </div>

          {actionMessage && (
            <InlineNotice title="Success" description={actionMessage} />
          )}
          {actionError && <ErrorState error={actionError} />}

          <section className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">Course Content</h2>
              <CourseStructure
                baseHref={`/learn/courses/${courseId}`}
                course={state.data}
              />
            </div>
            <CourseReviewsPanel reload={reviews.reload} state={reviews.state} />
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

function useLessonComments(
  courseId: string,
  sectionId: string,
  lessonId: string
) {
  return useLearnerResource<LessonCommentResponse>(
    () =>
      getLessonComments({
        client: apiClient,
        path: { courseId, lessonId, sectionId },
        throwOnError: true,
      }).then(({ data }) => data),
    [courseId, lessonId, sectionId]
  );
}

function LessonOutline({
  activeLessonId,
  course,
  courseId,
}: {
  activeLessonId: string;
  course: ResourceState<CourseCourseDetail>;
  courseId: string;
}) {
  if (course.status === 'loading') {
    return <CourseGridSkeleton />;
  }

  if (course.status === 'error') {
    return <ErrorState error={course.error} />;
  }

  const lessons = flattenLessons(course.data, courseId);

  if (!lessons.length) {
    return (
      <EmptyState
        title="No lessons"
        description="This course does not have lessons yet."
      />
    );
  }

  return (
    <Card className="bg-nm-bg shadow-nm-flat">
      <CardHeader>
        <CardTitle className="text-xl">Course Outline</CardTitle>
        <CardDescription>
          {lessons.length} lessons across {course.data.sections.length} sections
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {lessons.map((lesson) => {
          const active = lesson.lessonId === activeLessonId;
          return (
            <Button
              key={lesson.lessonId}
              asChild
              className="h-auto justify-start px-3 py-3 text-left"
              variant={active ? 'inset' : 'ghost'}
            >
              <Link href={lesson.href}>
                <span
                  className="
                    flex size-8 shrink-0 items-center justify-center rounded-xl
                    bg-nm-bg text-xs font-semibold text-primary
                    shadow-nm-flat-sm
                  "
                >
                  {lesson.lessonNumber}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {lesson.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {lesson.sectionTitle}
                  </span>
                </span>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function LessonCommentsPanel({
  comments,
  onSubmit,
  submitting,
  value,
  onChange,
}: {
  comments: ResourceState<LessonCommentResponse>;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card className="bg-nm-bg shadow-nm-flat">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquareText className="size-5 text-primary" />
          Discussion
        </CardTitle>
        <CardDescription>Top-level lesson comments</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className="grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit();
          }}
        >
          <label className="text-sm font-medium" htmlFor="lesson-comment">
            Comment
          </label>
          <textarea
            id="lesson-comment"
            className="
              min-h-24 w-full rounded-xl border-none bg-nm-bg px-4 py-3 text-sm
              shadow-nm-inset outline-none
              placeholder:text-muted-foreground
              focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:ring-offset-2
            "
            placeholder="Ask a question or leave a note"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="flex justify-end">
            <Button disabled={submitting || !value.trim()} type="submit">
              <Send className="mr-2 size-4" />
              Send comment
            </Button>
          </div>
        </form>

        {comments.status === 'loading' && <CourseGridSkeleton />}
        {comments.status === 'error' && <ErrorState error={comments.error} />}
        {comments.status === 'ready' && !comments.data.data.length && (
          <div
            className="
              rounded-2xl bg-nm-bg p-5 text-center text-sm text-slate-500
              shadow-nm-inset
            "
          >
            No comments yet.
          </div>
        )}
        {comments.status === 'ready' && comments.data.data.length > 0 && (
          <div className="grid gap-3">
            {comments.data.data.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-nm-bg p-4 shadow-nm-inset"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="font-medium text-slate-900">
                    User {item.userId}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>
                <p className="mt-2 text-sm/6 text-slate-700">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LessonNavigation({
  current,
  next,
  previous,
}: {
  current?: FlatLesson;
  next?: FlatLesson;
  previous?: FlatLesson;
}) {
  return (
    <div
      className="
        grid gap-3
        md:grid-cols-[1fr_auto_auto]
      "
    >
      <div className="rounded-2xl bg-nm-bg p-4 shadow-nm-inset">
        <p className="text-xs font-medium text-slate-500 uppercase">
          Current lesson
        </p>
        <p className="mt-1 truncate font-semibold text-slate-950">
          {current?.title ?? 'Lesson'}
        </p>
      </div>
      <Button
        asChild={Boolean(previous)}
        disabled={!previous}
        variant="outline"
      >
        {previous ? (
          <Link href={previous.href}>
            <ChevronLeft className="mr-2 size-4" />
            Previous
          </Link>
        ) : (
          <span>
            <ChevronLeft className="mr-2 size-4" />
            Previous
          </span>
        )}
      </Button>
      <Button asChild={Boolean(next)} disabled={!next}>
        {next ? (
          <Link href={next.href}>
            Next
            <ChevronRight className="ml-2 size-4" />
          </Link>
        ) : (
          <span>
            Next
            <ChevronRight className="ml-2 size-4" />
          </span>
        )}
      </Button>
    </div>
  );
}

function TestLessonContent({
  lesson,
}: {
  lesson: Extract<CourseLessonDetail, { lessonType: 'test' }>;
}) {
  const questions = Array.isArray(lesson.questions) ? lesson.questions : [];

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-nm-bg p-5 shadow-nm-inset">
        <div className="flex items-center gap-3">
          <ClipboardList className="size-5 text-primary" />
          <div>
            <p className="font-semibold text-slate-950">
              {questions.length} questions
            </p>
            <p className="text-sm text-slate-500">{lesson.questionType}</p>
          </div>
        </div>
      </div>

      {questions.map((question, index) => {
        const text =
          isRecord(question) && typeof question.question === 'string'
            ? question.question
            : `Question ${index + 1}`;
        const answers =
          isRecord(question) && Array.isArray(question.answers)
            ? question.answers
            : [];

        return (
          <div
            key={`${text}-${index}`}
            className="rounded-2xl bg-nm-bg p-5 shadow-nm-inset"
          >
            <h3 className="font-semibold text-slate-950">{text}</h3>
            <div className="mt-3 grid gap-2">
              {answers.map((answer, answerIndex) => {
                const answerText =
                  isRecord(answer) && typeof answer.content === 'string'
                    ? answer.content
                    : `Answer ${answerIndex + 1}`;
                return (
                  <div
                    key={`${answerText}-${answerIndex}`}
                    className="
                      rounded-xl bg-nm-bg px-3 py-2 text-sm text-slate-700
                      shadow-nm-flat-sm
                    "
                  >
                    {answerText}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LearnerLessonContent({
  courseId,
  lessonId,
  sectionId,
  viewer,
}: {
  courseId: string;
  lessonId: string;
  sectionId: string;
  viewer: Viewer;
}) {
  const { success: showToast } = useToast();
  const course = useCourseDetail(courseId);
  const comments = useLessonComments(courseId, sectionId, lessonId);
  const [state, setState] = useState<ResourceState<CourseLessonDetail>>({
    status: 'loading',
  });
  const [lessonReloadKey, setLessonReloadKey] = useState(0);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [watchSeconds, setWatchSeconds] = useState(0);
  const lastSavedSecondRef = useRef(0);

  const reloadLesson = useCallback(() => {
    setLessonReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    getLessonDetail({
      client: apiClient,
      path: { courseId, lessonId, sectionId },
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
  }, [courseId, lessonId, lessonReloadKey, sectionId]);

  useEffect(() => {
    lastSavedSecondRef.current = 0;
    setWatchSeconds(0);
  }, [lessonId]);

  const flatLessons = useMemo(
    () =>
      course.state.status === 'ready'
        ? flattenLessons(course.state.data, courseId)
        : [],
    [course.state, courseId]
  );
  const activeIndex = flatLessons.findIndex(
    (lesson) => lesson.lessonId === lessonId
  );
  const currentLesson = activeIndex >= 0 ? flatLessons[activeIndex] : undefined;
  const previousLesson =
    activeIndex > 0 ? flatLessons[activeIndex - 1] : undefined;
  const nextLesson =
    activeIndex >= 0 && activeIndex < flatLessons.length - 1
      ? flatLessons[activeIndex + 1]
      : undefined;

  async function saveProgress(
    seconds: number,
    completed: boolean,
    silent = false
  ) {
    if (state.status !== 'ready' || state.data.lessonType !== 'video') {
      return;
    }

    setBusyAction('progress');
    setActionError(null);
    try {
      await saveVideoLessonProgress({
        body: {
          isCompleted: completed,
          lastViewedAt: apiDate(),
          lessonId,
          watchedSeconds: Math.max(0, Math.floor(seconds)),
        },
        client: apiClient,
        path: { courseId, lessonId, sectionId },
        throwOnError: true,
      });
      if (!silent) {
        showToast('Lesson progress saved.');
      }
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function markCompleted() {
    setBusyAction('complete');
    setActionError(null);
    try {
      await markLessonAsCompleted({
        client: apiClient,
        path: { courseId, lessonId, sectionId },
        throwOnError: true,
      });
      showToast('Lesson progress updated.');
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitComment() {
    const content = comment.trim();
    if (!content) {
      return;
    }

    setBusyAction('comment');
    setActionError(null);
    try {
      await commentOnLesson({
        body: { content },
        client: apiClient,
        path: { courseId, lessonId, sectionId },
        throwOnError: true,
      });
      setComment('');
      comments.reload();
      showToast('Comment posted.');
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setBusyAction(null);
    }
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    const seconds = Math.floor(event.currentTarget.currentTime);
    setWatchSeconds(seconds);

    if (seconds > 0 && seconds - lastSavedSecondRef.current >= 20) {
      lastSavedSecondRef.current = seconds;
      void saveProgress(seconds, false, true);
    }
  }

  function handleVideoPause(event: SyntheticEvent<HTMLVideoElement>) {
    const seconds = Math.floor(event.currentTarget.currentTime);
    if (seconds > 0 && seconds !== lastSavedSecondRef.current) {
      lastSavedSecondRef.current = seconds;
      void saveProgress(seconds, false, true);
    }
  }

  function handleVideoEnded(event: SyntheticEvent<HTMLVideoElement>) {
    const seconds = Math.floor(
      event.currentTarget.duration || event.currentTarget.currentTime
    );
    lastSavedSecondRef.current = seconds;
    void saveProgress(seconds, true).then(() => markCompleted());
  }

  return (
    <AppShell
      description="Watch the lesson, keep progress updated, and discuss the material."
      eyebrow="Lesson"
      title="Lesson Content"
      viewer={viewer}
    >
      <div className="grid gap-4">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/learn/courses/${courseId}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back to course
            </Link>
          </Button>
        </div>

        {course.state.status === 'ready' && (
          <LessonNavigation
            current={currentLesson}
            next={nextLesson}
            previous={previousLesson}
          />
        )}

        {actionError && <ErrorState error={actionError} />}

        <div
          className="
            grid gap-6
            xl:grid-cols-[minmax(0,1fr)_360px]
          "
        >
          <div className="grid min-w-0 gap-6">
            {state.status === 'loading' && <CourseGridSkeleton />}
            {state.status === 'error' && (
              <ErrorState error={state.error} onRetry={reloadLesson} />
            )}
            {state.status === 'ready' && (
              <Card className="bg-nm-bg shadow-nm-flat">
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="inset">
                      {state.data.lessonType === 'video' ? (
                        <Video className="size-3" />
                      ) : (
                        <ClipboardList className="size-3" />
                      )}
                      {state.data.lessonType}
                    </Badge>
                    {state.data.lessonType === 'video' && (
                      <Badge variant="outline">
                        {formatDuration(state.data.duration)}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {state.data.lessonType === 'video' ? (
                      <PlayCircle className="size-5 text-primary" />
                    ) : (
                      <ClipboardList className="size-5 text-primary" />
                    )}
                    {state.data.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {state.data.lessonType === 'video' && state.data.videoUrl ? (
                    <>
                      <CourseVideoPlayer
                        className="shadow-nm-flat"
                        src={state.data.videoUrl}
                        title={state.data.title}
                        onEnded={handleVideoEnded}
                        onPause={handleVideoPause}
                        onTimeUpdate={handleTimeUpdate}
                      />
                      <div
                        className="
                          grid gap-3 rounded-2xl bg-nm-bg p-4 shadow-nm-inset
                        "
                      >
                        <div
                          className="
                            flex items-center justify-between gap-3 text-sm
                          "
                        >
                          <span className="font-medium text-slate-600">
                            Watched locally
                          </span>
                          <span className="font-semibold text-primary">
                            {formatDuration(watchSeconds)}
                          </span>
                        </div>
                        <Progress
                          value={
                            state.data.duration
                              ? Math.min(
                                  100,
                                  (watchSeconds / Number(state.data.duration)) *
                                    100
                                )
                              : 0
                          }
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            disabled={busyAction === 'progress'}
                            type="button"
                            variant="outline"
                            onClick={() => saveProgress(watchSeconds, false)}
                          >
                            <Save className="mr-2 size-4" />
                            Save progress
                          </Button>
                          <Button
                            disabled={busyAction === 'complete'}
                            type="button"
                            onClick={markCompleted}
                          >
                            <CheckCircle2 className="mr-2 size-4" />
                            Mark completed
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : state.data.lessonType === 'test' ? (
                    <TestLessonContent lesson={state.data} />
                  ) : (
                    <div
                      className="
                        rounded-xl bg-nm-bg p-6 text-sm text-slate-500
                        shadow-nm-inset
                      "
                    >
                      This lesson does not have playable content yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <LessonCommentsPanel
              comments={comments.state}
              onChange={setComment}
              onSubmit={submitComment}
              submitting={busyAction === 'comment'}
              value={comment}
            />
          </div>

          <aside className="grid content-start gap-4">
            <LessonOutline
              activeLessonId={lessonId}
              course={course.state}
              courseId={courseId}
            />
            <Button asChild variant="outline">
              <Link href={`/learn/courses/${courseId}`}>
                <RefreshCw className="mr-2 size-4" />
                Course overview
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

export function LearnerLessonPage({
  courseId,
  lessonId,
  sectionId,
}: {
  courseId: string;
  lessonId: string;
  sectionId: string;
}) {
  return (
    <AuthGate allowedRoles={['learner', 'instructor', 'admin']}>
      {(viewer) => (
        <LearnerLessonContent
          courseId={courseId}
          lessonId={lessonId}
          sectionId={sectionId}
          viewer={viewer}
        />
      )}
    </AuthGate>
  );
}
