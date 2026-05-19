'use client';

import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/shadcn/dialog';
import { Input } from '#/components/ui/neumorphism/input';
import { apiClient } from '#/lib/api';
import {
  bookmarkCourse,
  finishCourse,
  getLessonDetail,
  getMyBookmarkedCourses,
  getMyEnrolledCourses,
  reviewCourse,
  unbookmarkCourse,
} from '#/lib/api/course';
import type { CourseLessonDetail } from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import type { Viewer } from '#/lib/auth/roles';

import { CourseHero, CourseStructure } from './course-detail';
import { CourseVideoPlayer } from './course-video-player';
import { CourseGridSkeleton, ErrorState, InlineNotice } from './course-states';
import {
  type ResourceState,
  ListContent,
  normalizeTab,
  useCourseDetail,
  useCourseList,
} from './course-shared';

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
      {(activeTab === 'home' || activeTab === 'enrolled') && (
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
          {activeTab === 'home' && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Saved</h2>
              <ListContent
                state={bookmarked.state}
                reload={bookmarked.reload}
                destination="learner"
                emptyTitle="No bookmarks yet"
                emptyDescription="Bookmarks help you return to your courses faster."
              />
            </div>
          )}
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
      title="Course Content"
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
                      bookmarked ? 'Course removed from bookmarks.' : 'Course saved to bookmarks.'
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
            <CardContent>
              {state.data.lessonType === 'video' && state.data.videoUrl ? (
                <CourseVideoPlayer
                  src={state.data.videoUrl}
                  title={state.data.title}
                />
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
