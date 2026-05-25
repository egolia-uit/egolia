'use client';

import {
  ArrowLeft,
  Award,
  Bookmark,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  RefreshCw,
  Save,
  Search,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import { Input } from '#/components/ui/neumorphism/input';
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
  bookmarkCourse,
  finishCourse,
  getCourseProgress,
  getLessonDetail,
  getMyBookmarkedCourses,
  getMyCertificates,
  getMyEnrolledCourses,
  markLessonAsCompleted,
  reviewCourse,
  saveVideoLessonProgress,
  unbookmarkCourse,
} from '#/lib/api/course';
import type {
  CourseCertificate,
  CourseCourseProgress,
  CourseLessonDetail,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatDateTime } from '#/lib/api/format';
import type { Viewer } from '#/lib/auth/roles';

import { CourseHero, CourseStructure } from './course-detail';
import {
  ListContent,
  type ResourceState,
  normalizeTab,
  useCourseDetail,
  useCourseList,
} from './course-shared';
import { CourseGridSkeleton, ErrorState, InlineNotice } from './course-states';
import { CourseVideoPlayer } from './course-video-player';

type CertificateListResponse = {
  data: CourseCertificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

type TestAnswerView = {
  id?: string;
  content?: string;
  isCorrect?: boolean;
};

type TestQuestionView = {
  id?: string;
  question?: string;
  answers?: TestAnswerView[];
};

function parseTestQuestions(raw: unknown): TestQuestionView[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) =>
      typeof item === 'object' && item !== null
        ? (item as TestQuestionView)
        : null
    )
    .filter((item): item is TestQuestionView => Boolean(item));
}

function ProgressBar({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">Progress</span>
        <span className="font-semibold text-primary">{normalized}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-nm-bg shadow-nm-inset"
      >
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

function CertificatesPanel({
  state,
  reload,
}: {
  state: ResourceState<CertificateListResponse>;
  reload: () => void;
}) {
  if (state.status === 'loading') {
    return <CourseGridSkeleton />;
  }

  if (state.status === 'error') {
    return <ErrorState error={state.error} onRetry={reload} />;
  }

  if (!state.data.data.length) {
    return (
      <Card className="bg-nm-bg">
        <CardContent className="py-8 text-sm text-slate-600">
          You do not have any certificates yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="
        grid gap-4
        md:grid-cols-2
      "
    >
      {state.data.data.map((certificate) => (
        <Card key={certificate.id} className="bg-nm-bg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="size-5 text-primary" />
              Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500 uppercase">Course</div>
              <div className="mt-1 font-medium break-all text-slate-900">
                {certificate.courseId}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">Issued</div>
              <div className="mt-1 font-medium text-slate-900">
                {formatDateTime(certificate.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
    'enrolled',
    'bookmarked',
    'certificates',
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
  const [certificates, setCertificates] = useState<
    ResourceState<CertificateListResponse>
  >({ status: 'loading' });
  const [certificateReloadKey, setCertificateReloadKey] = useState(0);

  const reloadCertificates = useCallback(
    () => setCertificateReloadKey((key) => key + 1),
    []
  );

  useEffect(() => {
    let mounted = true;

    getMyCertificates({
      client: apiClient,
      query: { limit: 12, page: 1 },
      throwOnError: true,
    })
      .then(({ data }) => {
        if (mounted) {
          setCertificates({ status: 'ready', data });
        }
      })
      .catch((error) => {
        if (mounted) {
          setCertificates({ status: 'error', error: normalizeApiError(error) });
        }
      });

    return () => {
      mounted = false;
    };
  }, [certificateReloadKey]);

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Learning"
      title="Learning Workspace"
      actions={
        <Button asChild>
          <Link href="/courses">
            <Search className="mr-2 size-4" />
            Explore Courses
          </Link>
        </Button>
      }
    >
      {activeTab === 'enrolled' && (
        <section className="grid gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">In Progress</h2>
            <ListContent
              state={enrolled.state}
              reload={enrolled.reload}
              destination="learner"
              emptyTitle="You have not enrolled in any courses"
              emptyDescription="Go to explore to see available courses."
            />
          </div>
        </section>
      )}

      {activeTab === 'bookmarked' && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Saved</h2>
          <ListContent
            state={bookmarked.state}
            reload={bookmarked.reload}
            destination="learner"
            emptyTitle="No bookmarks yet"
            emptyDescription="Bookmarks help you return to your courses faster."
          />
        </section>
      )}

      {activeTab === 'certificates' && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Certificates</h2>
          <CertificatesPanel state={certificates} reload={reloadCertificates} />
        </section>
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
  const { state, reload } = useCourseDetail(courseId);
  const [progress, setProgress] = useState<ResourceState<CourseCourseProgress>>(
    { status: 'loading' }
  );
  const [progressReloadKey, setProgressReloadKey] = useState(0);
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

  const bookmarked = bookmarkedIds.has(courseId);

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
      refreshBookmarks();
      reloadProgress();
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
    <AppShell viewer={viewer} eyebrow="Chi tiết" title="Course Content">
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
                    <Button type="button" className="w-full">
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
                                rating: Number.parseInt(rating, 10),
                                comment,
                              },
                              client: apiClient,
                              path: { courseId },
                              throwOnError: true,
                            }),
                          'Thank you for reviewing this course!'
                        );
                        if (ok) {
                          setReviewOpen(false);
                          setComment('');
                        }
                      }}
                    >
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Rating (1-5)
                        </label>
                        <Input
                          min={1}
                          max={5}
                          type="number"
                          value={rating}
                          onChange={(event) => setRating(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Your comment
                        </label>
                        <textarea
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
                        type="submit"
                        disabled={busyAction === 'review' || !comment.trim()}
                      >
                        <Save className="mr-2 size-4" />
                        Submit review
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  disabled={busyAction === 'bookmark'}
                  className="w-full"
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
                  type="button"
                  variant="outline"
                  disabled={busyAction === 'finish'}
                  className="w-full"
                  onClick={() =>
                    runAction(
                      'finish',
                      () =>
                        finishCourse({
                          client: apiClient,
                          path: { courseId },
                          throwOnError: true,
                        }),
                      'Congratulations! You have completed the course.'
                    )
                  }
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Mark finished
                </Button>
              </div>
            }
          />

          {actionMessage && (
            <InlineNotice title="Success" description={actionMessage} />
          )}
          {actionError && <ErrorState error={actionError} />}

          <section className="grid gap-6">
            <CourseProgressPanel progress={progress} reload={reloadProgress} />
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold">Course Content</h2>
              <CourseStructure
                course={state.data}
                baseHref={`/learn/courses/${courseId}`}
              />
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
  const [state, setState] = useState<ResourceState<CourseLessonDetail>>({
    status: 'loading',
  });
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

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
  }, [courseId, lessonId, sectionId]);

  async function runLessonAction(
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
    } catch (error) {
      setActionError(normalizeApiError(error));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <AppShell viewer={viewer} eyebrow="Lesson" title="Lesson Content">
      <div className="grid gap-4">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/learn/courses/${courseId}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back to course
            </Link>
          </Button>
        </div>

        {state.status === 'loading' && <CourseGridSkeleton />}
        {state.status === 'error' && <ErrorState error={state.error} />}
        {actionMessage && (
          <InlineNotice title="Success" description={actionMessage} />
        )}
        {actionError && <ErrorState error={actionError} />}
        {state.status === 'ready' && (
          <Card className="bg-nm-bg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {state.data.lessonType === 'video' ? (
                  <PlayCircle className="size-5 text-primary" />
                ) : (
                  <ClipboardList className="size-5 text-primary" />
                )}
                {state.data.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {state.data.lessonType === 'video' && state.data.videoUrl ? (
                <>
                  <CourseVideoPlayer
                    src={state.data.videoUrl}
                    title={state.data.title}
                    onEnded={() =>
                      runLessonAction(
                        'complete',
                        () =>
                          markLessonAsCompleted({
                            client: apiClient,
                            path: { courseId, lessonId, sectionId },
                            throwOnError: true,
                          }),
                        'Lesson marked as completed.'
                      )
                    }
                    onTimeUpdate={(currentTime) =>
                      setWatchedSeconds(Math.max(0, Math.floor(currentTime)))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyAction === 'save-progress'}
                      onClick={() =>
                        runLessonAction(
                          'save-progress',
                          () =>
                            saveVideoLessonProgress({
                              body: {
                                isCompleted: false,
                                lastViewedAt: new Date(),
                                lessonId,
                                watchedSeconds,
                              },
                              client: apiClient,
                              path: { courseId, lessonId, sectionId },
                              throwOnError: true,
                            }),
                          'Video progress saved.'
                        )
                      }
                    >
                      <Save className="mr-2 size-4" />
                      Save progress
                    </Button>
                    <Button
                      type="button"
                      disabled={busyAction === 'complete'}
                      onClick={() =>
                        runLessonAction(
                          'complete',
                          () =>
                            markLessonAsCompleted({
                              client: apiClient,
                              path: { courseId, lessonId, sectionId },
                              throwOnError: true,
                            }),
                          'Lesson marked as completed.'
                        )
                      }
                    >
                      <CheckCircle2 className="mr-2 size-4" />
                      Mark completed
                    </Button>
                  </div>
                </>
              ) : state.data.lessonType === 'test' ? (
                <div className="grid gap-4">
                  {parseTestQuestions(state.data.questions).map(
                    (question, questionIndex) => (
                      <div
                        key={question.id ?? questionIndex}
                        className="rounded-xl bg-nm-bg p-4 shadow-nm-inset"
                      >
                        <div className="font-medium text-slate-900">
                          {questionIndex + 1}.{' '}
                          {question.question || 'Untitled question'}
                        </div>
                        <div className="mt-3 grid gap-2">
                          {(question.answers ?? []).map(
                            (answer, answerIndex) => (
                              <label
                                key={answer.id ?? answerIndex}
                                className="
                                  flex items-center gap-2 rounded-lg bg-white/45
                                  px-3 py-2 text-sm text-slate-700
                                "
                              >
                                <input
                                  type="checkbox"
                                  checked={answer.isCorrect === true}
                                  readOnly
                                  className="size-4"
                                />
                                {answer.content || `Answer ${answerIndex + 1}`}
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    disabled={busyAction === 'complete'}
                    onClick={() =>
                      runLessonAction(
                        'complete',
                        () =>
                          markLessonAsCompleted({
                            client: apiClient,
                            path: { courseId, lessonId, sectionId },
                            throwOnError: true,
                          }),
                        'Lesson marked as completed.'
                      )
                    }
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Mark completed
                  </Button>
                </div>
              ) : (
                <div
                  className="
                    rounded-xl bg-nm-bg p-6 text-sm text-slate-500
                    shadow-nm-inset
                  "
                >
                  This lesson does not have a video to play.
                </div>
              )}
            </CardContent>
          </Card>
        )}
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
