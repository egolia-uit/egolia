'use client';

import {
  ArrowLeft,
  Award,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock3,
  FileQuestion,
  Home,
  Layers3,
  ListChecks,
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
  X,
} from 'lucide-react';
import Link from 'next/link';
import {
  type DependencyList,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { cn } from '#/components/lib/shadcn/utils';
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
  type CourseCourseProgress,
  type CourseLessonComment,
  type CourseLessonDetail,
  type CoursePagination,
  type CourseTestAnswer,
  type CourseTestQuestion,
  bookmarkCourse,
  commentOnLesson,
  finishCourse,
  getCourseProgress,
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
import { formatDateTime, formatDuration, formatVnd } from '#/lib/api/format';
import type { Viewer } from '#/lib/auth/roles';

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

function ProgressBar({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">Progress</span>
        <span className="font-semibold text-primary">{normalized}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-nm-bg shadow-nm-inset">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}

function CourseProgressPanel({
  progress,
  reload,
}: {
  progress: ResourceState<CourseCourseProgress>;
  reload: () => void;
}) {
  if (progress.status === 'loading') {
    return <CourseGridSkeleton />;
  }

  if (progress.status === 'error') {
    return <ErrorState error={progress.error} onRetry={reload} />;
  }

  return (
    <Card className="bg-nm-bg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="size-5 text-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ProgressBar value={progress.data.progressPercent} />
        <div
          className="
            grid gap-3 rounded-xl bg-nm-bg p-4 text-sm shadow-nm-inset
            md:grid-cols-3
          "
        >
          <div>
            <div className="text-xs text-slate-500 uppercase">Lessons</div>
            <div className="mt-1 font-semibold text-slate-900">
              {progress.data.completedLessons}/{progress.data.totalLessons}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">State</div>
            <div className="mt-1 font-semibold text-slate-900">
              {progress.data.isCompleted ? 'Completed' : 'In progress'}
            </div>
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={reload}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

const learnerPanel =
  'rounded-xl border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur';
const learnerSoftPanel =
  'rounded-xl border border-slate-200/70 bg-slate-50/70 shadow-none';
const learnerIconBox =
  'flex shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary ring-1 ring-blue-100';
const learnerButton =
  'transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0';

type NormalizedQuizAnswer = Pick<
  CourseTestAnswer,
  'content' | 'id' | 'isCorrect'
>;

type NormalizedQuizQuestion = Pick<CourseTestQuestion, 'id' | 'question'> & {
  answers: NormalizedQuizAnswer[];
};

function normalizeQuizQuestions(items: unknown[]): NormalizedQuizQuestion[] {
  return items.map((item, index) => {
    const question = isRecord(item) ? item : {};
    const questionId =
      typeof question.id === 'string' && question.id
        ? question.id
        : `question-${index + 1}`;
    const questionText =
      typeof question.question === 'string' && question.question
        ? question.question
        : `Question ${index + 1}`;
    const answers = Array.isArray(question.answers) ? question.answers : [];

    return {
      answers: answers.map((answer, answerIndex) => {
        const record = isRecord(answer) ? answer : {};
        const answerId =
          typeof record.id === 'string' && record.id
            ? record.id
            : `${questionId}-answer-${answerIndex + 1}`;

        return {
          content:
            typeof record.content === 'string' && record.content
              ? record.content
              : `Answer ${answerIndex + 1}`,
          id: answerId,
          isCorrect: record.isCorrect === true,
        };
      }),
      id: questionId,
      question: questionText,
    };
  });
}

function sameAnswerSet(selectedIds: string[], correctIds: string[]) {
  if (selectedIds.length !== correctIds.length) {
    return false;
  }

  const selected = [...selectedIds].sort();
  const correct = [...correctIds].sort();

  return selected.every((id, index) => id === correct[index]);
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
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="
            flex size-12 shrink-0 items-center justify-center rounded-xl
            bg-blue-50 text-blue-600
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

function LearnerMetric({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className={cn(learnerSoftPanel, 'p-4')}>
      <div className="flex items-start gap-3">
        <span className={cn(learnerIconBox, 'size-10')}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span
            className="
              block text-xs font-semibold tracking-normal text-slate-500
              uppercase
            "
          >
            {label}
          </span>
          <span className="mt-1 block text-xl font-semibold text-slate-950">
            {value}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {helper}
          </span>
        </span>
      </div>
    </div>
  );
}

function LearnerCourseHero({
  actions,
  course,
  lessonCount,
}: {
  actions: ReactNode;
  course: CourseCourseDetail;
  lessonCount: number;
}) {
  return (
    <Card className={cn(learnerPanel, 'overflow-hidden')}>
      <CardContent
        className="
          grid gap-6 p-4
          lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6
        "
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="inset">
              <CheckCircle2 className="size-3" />
              {course.status ?? 'ready'}
            </Badge>
            <Badge variant="outline">
              <Layers3 className="size-3" />
              {course.sections.length} sections
            </Badge>
            <Badge variant="outline">
              <ListChecks className="size-3" />
              {lessonCount} lessons
            </Badge>
          </div>

          <div className="mt-5 grid gap-3">
            <h2 className="text-3xl leading-tight font-semibold text-slate-950">
              {course.title}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {course.overview?.trim() ||
                'Course overview is not available yet. You can still start from the first lesson and follow the roadmap below.'}
            </p>
          </div>

          <div
            className="
            mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-950
            shadow-sm
          "
          >
            {course.introductionVideoUrl ? (
              <CourseVideoPlayer
                className="shadow-none"
                src={course.introductionVideoUrl}
                title={`${course.title} introduction`}
              />
            ) : (
              <div
                className="
                  flex aspect-video items-center justify-center rounded-xl
                  bg-slate-50 p-8 text-center text-sm text-slate-500
                "
              >
                <div className="grid justify-items-center gap-3">
                  <BookOpen className="size-8 text-primary" />
                  <span>No introduction video is available.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className={cn(learnerSoftPanel, 'grid content-start gap-4 p-4')}>
          <div>
            <p className="text-sm font-semibold text-primary">Study plan</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Continue with structure
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Start from the first lesson, save the course, or leave a review
              after learning.
            </p>
          </div>

          <div className="grid gap-3">
            <LearnerMetric
              helper="Course price"
              icon={Award}
              label="Price"
              value={formatVnd(course.price)}
            />
            <LearnerMetric
              helper="Instructor profile"
              icon={BookOpenCheck}
              label="Instructor"
              value={course.instructorId ?? 'N/A'}
            />
            <LearnerMetric
              helper="Saved progress is tracked per lesson"
              icon={Clock3}
              label="Workspace"
              value="Ready"
            />
          </div>

          <div className="grid gap-2">{actions}</div>
        </aside>
      </CardContent>
    </Card>
  );
}

function LearnerCourseRoadmap({
  course,
  courseId,
}: {
  course: CourseCourseDetail;
  courseId: string;
}) {
  const lessons = flattenLessons(course, courseId);

  if (!lessons.length) {
    return (
      <EmptyState
        title="No lessons"
        description="This course does not have lessons yet."
      />
    );
  }

  return (
    <section className="grid gap-4">
      <div
        className={cn(
          learnerSoftPanel,
          'flex flex-wrap items-end justify-between gap-3 p-5'
        )}
      >
        <div>
          <p className="text-sm font-semibold text-primary">Roadmap</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Course content
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Follow the sections in order. Lesson pages handle progress, tests,
            and discussion.
          </p>
        </div>
        <Badge variant="outline">
          <ListChecks className="size-3" />
          {lessons.length} lessons
        </Badge>
      </div>

      <div className="grid gap-4">
        {course.sections.map((section, sectionIndex) => (
          <div key={section.id} className={cn(learnerPanel, 'p-4')}>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(learnerIconBox, 'size-10 text-sm font-semibold')}
              >
                {sectionIndex + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-slate-950">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {section.lessons.length} lessons
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {section.lessons.map((lesson, lessonIndex) => {
                const href = `/learn/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}`;

                return (
                  <Link
                    key={lesson.id ?? `${section.id}-${lessonIndex}`}
                    className="
                      group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto]
                      items-center gap-3 rounded-lg border border-slate-200/70
                      bg-white px-4 py-3 transition-colors
                      hover:border-primary/30 hover:bg-blue-50/40
                      focus-visible:ring-2 focus-visible:ring-primary
                      focus-visible:outline-none
                    "
                    href={href}
                  >
                    <span className={cn(learnerIconBox, 'size-9')}>
                      <PlayCircle className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="
                        block truncate font-semibold text-slate-950
                      "
                      >
                        {lesson.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Lesson {lessonIndex + 1}
                      </span>
                    </span>
                    <span
                      className="
                        rounded-md border border-slate-200 bg-white px-3 py-1
                        text-xs font-semibold text-slate-600 transition-colors
                        group-hover:text-primary
                      "
                    >
                      Open
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
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
    <Card>
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
    <Card>
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
              flex flex-col gap-3 rounded-xl border border-slate-200/60
              bg-slate-50 p-4
              md:flex-row md:items-center md:justify-between
            "
          >
            <div className="min-w-0">
              <div
                className="
                flex items-center gap-2 font-semibold text-slate-900
              "
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
  initialTab = 'enrolled',
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
  const [progress, setProgress] = useState<ResourceState<CourseCourseProgress>>(
    { status: 'loading' }
  );
  const [progressReloadKey, setProgressReloadKey] = useState(0);
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

  const reloadProgress = useCallback(
    () => setProgressReloadKey((key) => key + 1),
    []
  );

  useEffect(() => {
    let mounted = true;

    getCourseProgress({
      client: apiClient,
      path: { courseId },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setProgress({ status: 'ready', data: data.data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setProgress({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId, progressReloadKey]);

  const bookmarked = state.status === 'ready' && bookmarkedIds.has(courseId);
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
      reloadProgress();
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
      description="Pick up the course roadmap, move through lessons, and keep every learning action in one workspace."
      eyebrow="Learning"
      title="Learning Studio"
      viewer={viewer}
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <LearnerCourseHero
            actions={
              <>
                {firstLesson ? (
                  <Button asChild className={cn(learnerButton, 'w-full')}>
                    <Link href={firstLesson}>
                      <PlayCircle className="mr-2 size-4" />
                      Continue learning
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className={cn(learnerButton, 'w-full')}
                    disabled
                    type="button"
                  >
                    <PlayCircle className="mr-2 size-4" />
                    No lessons
                  </Button>
                )}

                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(learnerButton, 'w-full')}
                    >
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
                            min-h-24 w-full rounded-lg border border-slate-200
                            bg-white px-4 py-2 text-sm shadow-sm
                            transition-colors outline-none
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
                        className={learnerButton}
                      >
                        <Save className="mr-2 size-4" />
                        Submit review
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  disabled={busyAction === 'bookmark'}
                  type="button"
                  variant="outline"
                  className={cn(learnerButton, 'w-full')}
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
                  disabled={busyAction === 'finish'}
                  type="button"
                  variant="outline"
                  className={cn(learnerButton, 'w-full')}
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
              </>
            }
            course={state.data}
            lessonCount={lessonCount}
          />

          {actionMessage && (
            <InlineNotice title="Success" description={actionMessage} />
          )}
          {actionError && <ErrorState error={actionError} />}

          <section className="grid gap-6">
            <CourseProgressPanel progress={progress} reload={reloadProgress} />
            <LearnerCourseRoadmap course={state.data} courseId={courseId} />
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
        responseValidator: async (data: any) => data,
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
    <Card className={learnerPanel}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className={cn(learnerIconBox, 'size-11')}>
            <ListChecks className="size-5" />
          </span>
          <div>
            <CardTitle className="text-xl">Lesson map</CardTitle>
            <CardDescription>
              {lessons.length} lessons across {course.data.sections.length}{' '}
              sections
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {lessons.map((lesson) => {
          const active = lesson.lessonId === activeLessonId;
          return (
            <Link
              key={lesson.lessonId}
              aria-current={active ? 'page' : undefined}
              className={cn(
                `
                  grid min-h-14 grid-cols-[auto_minmax(0,1fr)] items-center
                  gap-3 rounded-lg px-3 py-3 text-left transition-colors
                  focus-visible:ring-2 focus-visible:ring-primary
                  focus-visible:outline-none
                `,
                active
                  ? 'border border-primary/25 bg-blue-50 text-primary'
                  : `
                    border border-transparent bg-transparent
                    hover:border-slate-200 hover:bg-slate-50
                  `
              )}
              href={lesson.href}
            >
              <span
                className={cn(
                  `
                    flex size-8 shrink-0 items-center justify-center rounded-lg
                    text-xs font-semibold ring-1
                  `,
                  active
                    ? 'bg-white text-primary ring-primary/20'
                    : 'bg-slate-50 text-slate-500 ring-slate-200'
                )}
              >
                {active ? (
                  <PlayCircle className="size-4" />
                ) : (
                  lesson.lessonNumber
                )}
              </span>
              <span className="min-w-0">
                <span
                  className="
                    block truncate text-sm font-semibold text-slate-950
                  "
                >
                  {lesson.title}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {lesson.sectionTitle}
                </span>
              </span>
            </Link>
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
    <Card className={learnerPanel}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className={cn(learnerIconBox, 'size-11')}>
            <MessageSquareText className="size-5" />
          </span>
          <div>
            <CardTitle className="text-xl">Discussion</CardTitle>
            <CardDescription>
              Ask questions or leave notes for this lesson.
            </CardDescription>
          </div>
        </div>
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
            Add a note
          </label>
          <textarea
            id="lesson-comment"
            className="
              min-h-24 w-full rounded-lg border border-slate-200 bg-white px-4
              py-3 text-sm shadow-sm outline-none
              placeholder:text-muted-foreground
              focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:ring-offset-2
            "
            placeholder="Ask a question or share what you noticed"
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
              grid justify-items-center gap-2 rounded-xl border border-slate-200
              bg-slate-50 p-6 text-center text-sm text-slate-500
            "
          >
            <MessageSquareText className="size-5 text-primary" />
            No comments yet.
          </div>
        )}
        {comments.status === 'ready' && comments.data.data.length > 0 && (
          <div className="grid gap-3">
            {comments.data.data.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div
                  className="
                  flex flex-wrap items-center justify-between gap-2
                "
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
      className={cn(
        learnerPanel,
        `
          grid gap-3 p-3
          md:grid-cols-[1fr_auto_auto] md:items-center
        `
      )}
    >
      <div className="flex min-w-0 items-center gap-3 px-1">
        <span className={cn(learnerIconBox, 'size-11')}>
          <BookOpenCheck className="size-5" />
        </span>
        <span className="min-w-0">
          <span
            className="
              block text-xs font-semibold tracking-normal text-slate-500
              uppercase
            "
          >
            Current lesson
          </span>
          <span className="mt-1 block truncate font-semibold text-slate-950">
            {current?.title ?? 'Lesson'}
          </span>
        </span>
      </div>
      <Button
        asChild={Boolean(previous)}
        disabled={!previous}
        variant="outline"
        className={cn(learnerButton, 'min-w-32')}
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
      <Button
        asChild={Boolean(next)}
        disabled={!next}
        className={cn(learnerButton, 'min-w-32')}
      >
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
  completing = false,
  onComplete,
}: {
  completing?: boolean;
  lesson: Extract<CourseLessonDetail, { lessonType: 'test' }>;
  onComplete?: () => Promise<void>;
}) {
  const questions = useMemo(
    () =>
      normalizeQuizQuestions(
        Array.isArray(lesson.questions) ? lesson.questions : []
      ),
    [lesson.questions]
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const multipleChoice = lesson.questionType === 'multipleChoice';
  const answeredCount = questions.filter(
    (question) => (selectedAnswers[question.id] ?? []).length > 0
  ).length;
  const score = questions.reduce((result, question) => {
    const selected = selectedAnswers[question.id] ?? [];
    const correct = question.answers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.id);

    return result + (sameAnswerSet(selected, correct) ? 1 : 0);
  }, 0);
  const scorePercent = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  function toggleAnswer(questionId: string, answerId: string) {
    if (submitted) {
      return;
    }

    setSelectedAnswers((current) => {
      const selected = current[questionId] ?? [];
      const next = multipleChoice
        ? selected.includes(answerId)
          ? selected.filter((id) => id !== answerId)
          : [...selected, answerId]
        : [answerId];

      return {
        ...current,
        [questionId]: next,
      };
    });
  }

  return (
    <div className="grid gap-5">
      <div
        className={cn(
          learnerSoftPanel,
          `
            grid gap-4 p-5
            sm:grid-cols-[1fr_auto] sm:items-center
          `
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn(learnerIconBox, 'size-12')}>
            <FileQuestion className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-slate-950">
              Knowledge check
            </p>
            <p className="text-sm text-slate-500">
              {questions.length} questions -{' '}
              {multipleChoice ? 'multiple choice' : 'single choice'}
            </p>
          </div>
        </div>
        <div className="min-w-40">
          <div
            className="
              mb-2 flex items-center justify-between text-xs font-medium
              text-slate-500
            "
          >
            <span>Answered</span>
            <span>
              {answeredCount}/{questions.length}
            </span>
          </div>
          <Progress
            className="h-2 bg-slate-200 shadow-none"
            value={
              questions.length ? (answeredCount / questions.length) * 100 : 0
            }
          />
        </div>
      </div>

      {!questions.length && (
        <div
          className="
            rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm
            text-slate-500
          "
        >
          This test does not have questions yet.
        </div>
      )}

      {questions.map((question, index) => {
        const selected = selectedAnswers[question.id] ?? [];
        const correctAnswers = question.answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => answer.id);
        const questionCorrect = sameAnswerSet(selected, correctAnswers);

        return (
          <fieldset key={question.id} className={cn(learnerPanel, 'p-5')}>
            <legend className="w-full">
              <div className="flex items-start gap-3">
                <span
                  className={cn(learnerIconBox, 'size-9 text-sm font-semibold')}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-950">
                    {question.question}
                  </h3>
                  {submitted && (
                    <p
                      className={cn(
                        'mt-2 flex items-center gap-2 text-sm font-medium',
                        questionCorrect ? 'text-emerald-700' : 'text-rose-700'
                      )}
                    >
                      {questionCorrect ? (
                        <Check className="size-4" />
                      ) : (
                        <X className="size-4" />
                      )}
                      {questionCorrect ? 'Correct' : 'Needs review'}
                    </p>
                  )}
                </div>
              </div>
            </legend>

            <div
              aria-label={question.question}
              className="mt-4 grid gap-2"
              role={multipleChoice ? 'group' : 'radiogroup'}
            >
              {question.answers.map((answer) => {
                const checked = selected.includes(answer.id);
                const revealCorrect = submitted && answer.isCorrect;
                const revealWrong = submitted && checked && !answer.isCorrect;

                return (
                  <button
                    key={answer.id}
                    aria-checked={checked}
                    className={cn(
                      `
                        grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto]
                        items-center gap-3 rounded-lg border px-4 py-3 text-left
                        text-sm text-slate-700 shadow-sm transition-colors
                        hover:bg-slate-50
                        focus-visible:ring-2 focus-visible:ring-primary
                        focus-visible:outline-none
                      `,
                      checked
                        ? 'border-primary/30 bg-blue-50 text-slate-950'
                        : 'border-slate-200 bg-white',
                      revealCorrect &&
                        'border-emerald-200 bg-emerald-50 text-emerald-800',
                      revealWrong && 'border-rose-200 bg-rose-50 text-rose-800'
                    )}
                    disabled={submitted}
                    role={multipleChoice ? 'checkbox' : 'radio'}
                    type="button"
                    onClick={() => toggleAnswer(question.id, answer.id)}
                  >
                    <span
                      className={cn(
                        `
                          flex size-7 shrink-0 items-center justify-center
                          rounded-md border bg-white
                        `,
                        checked || revealCorrect
                          ? 'border-primary/30 text-primary'
                          : 'border-slate-200 text-slate-400'
                      )}
                    >
                      {checked || revealCorrect ? (
                        <Check className="size-4" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                    </span>
                    <span className="min-w-0 leading-6">{answer.content}</span>
                    {submitted && (
                      <span className="text-xs font-semibold">
                        {revealCorrect
                          ? 'Correct'
                          : revealWrong
                            ? 'Your answer'
                            : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div
        className={cn(
          learnerSoftPanel,
          'flex flex-wrap items-center justify-between gap-3 p-4'
        )}
      >
        <div>
          <p className="font-semibold text-slate-950">
            {submitted
              ? `Score ${score}/${questions.length} (${scorePercent}%)`
              : 'Submit when every question has an answer'}
          </p>
          <p className="text-sm text-slate-500">
            Results are shown immediately for this lesson test.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {submitted && (
            <Button
              type="button"
              variant="outline"
              className={learnerButton}
              onClick={() => {
                setSelectedAnswers({});
                setSubmitted(false);
              }}
            >
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
          )}
          {!submitted ? (
            <Button
              disabled={!questions.length || answeredCount < questions.length}
              type="button"
              className={learnerButton}
              onClick={() => setSubmitted(true)}
            >
              <ListChecks className="mr-2 size-4" />
              Submit answers
            </Button>
          ) : (
            <Button
              disabled={completing || !onComplete}
              type="button"
              className={learnerButton}
              onClick={() => {
                void onComplete?.();
              }}
            >
              <CheckCircle2 className="mr-2 size-4" />
              Mark lesson completed
            </Button>
          )}
        </div>
      </div>
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
      responseValidator: async (data: any) => data,
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
      description="Watch, test your understanding, save progress, and discuss the lesson."
      eyebrow="Lesson"
      title="Lesson Workspace"
      viewer={viewer}
    >
      <div className="grid gap-4">
        <div>
          <Button asChild variant="outline" size="sm" className={learnerButton}>
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
              <Card className={learnerPanel}>
                <CardHeader>
                  <div className="flex flex-wrap items-start gap-4">
                    <span className={cn(learnerIconBox, 'size-12')}>
                      {state.data.lessonType === 'video' ? (
                        <Video className="size-5" />
                      ) : (
                        <FileQuestion className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="inset">
                          {state.data.lessonType === 'video' ? (
                            <Video className="size-3" />
                          ) : (
                            <ClipboardList className="size-3" />
                          )}
                          {state.data.lessonType === 'video'
                            ? 'Video lesson'
                            : 'Test lesson'}
                        </Badge>
                        {state.data.lessonType === 'video' && (
                          <Badge variant="outline">
                            <Clock3 className="size-3" />
                            {formatDuration(state.data.duration)}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl leading-tight">
                        {state.data.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {state.data.lessonType === 'video' && state.data.videoUrl ? (
                    <>
                      <CourseVideoPlayer
                        className="border border-slate-200 shadow-sm"
                        src={state.data.videoUrl}
                        title={state.data.title}
                        onEnded={handleVideoEnded}
                        onPause={handleVideoPause}
                        onTimeUpdate={handleTimeUpdate}
                      />
                      <div className={cn(learnerSoftPanel, 'grid gap-3 p-4')}>
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
                          className="h-2 bg-slate-200 shadow-none"
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
                            className={learnerButton}
                            onClick={() => saveProgress(watchSeconds, false)}
                          >
                            <Save className="mr-2 size-4" />
                            Save progress
                          </Button>
                          <Button
                            disabled={busyAction === 'complete'}
                            type="button"
                            className={learnerButton}
                            onClick={markCompleted}
                          >
                            <CheckCircle2 className="mr-2 size-4" />
                            Mark completed
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : state.data.lessonType === 'test' ? (
                    <TestLessonContent
                      key={state.data.id ?? lessonId}
                      completing={busyAction === 'complete'}
                      lesson={state.data}
                      onComplete={markCompleted}
                    />
                  ) : (
                    <div
                      className="
                        rounded-xl border border-slate-200 bg-slate-50 p-6
                        text-sm text-slate-500
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
            <Button asChild variant="outline" className={learnerButton}>
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
