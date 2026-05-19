'use client';

import {
  Eye,
  EyeOff,
  FilePlus2,
  Pencil,
  Trash2,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Button } from '#/components/ui/neumorphism/button';
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
  type CourseCourseWritable,
  createCourse,
  createDraftVersion,
  deleteCourse,
  getCourseForUpdate,
  getMyCourses,
  hideCourse,
  submitCourse,
  unhideCourse,
  updateCourse,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import type { Viewer } from '#/lib/auth/roles';

import { CourseCurriculumEditor } from './course-curriculum-editor';
import { CourseForm } from './course-form';
import { CourseGridSkeleton, ErrorState } from './course-states';
import { isDraftLike, ListContent, normalizeTab, type ResourceState, uploadCourseVideo, useCourseDetail, useCourseList } from './course-shared';

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
  const { success: showToast } = useToast();
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
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

  const displayedCourses = useMemo<ResourceState<any>>(() => {
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
    try {
      const response = await createCourse({
        body,
        client: apiClient,
        throwOnError: true,
      });
      courses.reload();
      showToast('Course created successfully!');
      setCreateOpen(false);
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

  async function mutateCourse(action: () => Promise<unknown>, success: string) {
    setActionError(null);
    try {
      await action();
      showToast(success);
      courses.reload();
    } catch (error) {
      setActionError(normalizeApiError(error));
    }
  }

  return (
    <AppShell
      viewer={viewer}
      eyebrow="Teaching"
      title="Manage Courses"
      actions={
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <FilePlus2 className="mr-2 size-4" />
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
                onUploadIntroductionVideo={(file, onProgress) => uploadCourseVideo(crypto.randomUUID(), file, onProgress)}
                onSubmit={create}
              />
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4">
        {actionError && <ErrorState error={actionError} />}
        <ListContent
          state={displayedCourses}
          reload={courses.reload}
          destination="instructor"
          emptyTitle={
            activeTab === 'drafts'
              ? 'No drafts available'
              : 'You do not have any courses'
          }
          emptyDescription={
            activeTab === 'drafts'
              ? 'Click edit in the approved course details to create a draft.'
              : 'Create your first course using the Create course button.'
          }
          actionFor={(course) => (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/instructor/courses/${course.id}${course.status === 'draft' ? '/builder' : ''}`}>
                  <Eye className="mr-2 size-4" />
                  Manage
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  mutateCourse(
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
                    course.hidden ? 'Course is now visible.' : 'Course is now hidden.'
                  )
                }
              >
                {course.hidden ? (
                  <Eye className="mr-2 size-4" />
                ) : (
                  <EyeOff className="mr-2 size-4" />
                )}
                {course.hidden ? 'Unhide' : 'Hide'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  mutateCourse(
                    () =>
                      deleteCourse({
                        client: apiClient,
                        path: { courseId: course.id ?? '' },
                        throwOnError: true,
                      }),
                    'Course has been deleted.'
                  )
                }
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          )}
        />
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
  const { success: showToast } = useToast();
  const { state, reload } = useCourseDetail(courseId);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setSubmitting(true);
    setActionError(null);
    try {
      await action();
      showToast(success);
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
      eyebrow="Management"
      title="Course Detail"
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-4">
          <div className="rounded-2xl bg-nm-bg/95 px-4 py-3 shadow-nm-flat-sm">
            <div className="
              flex flex-col gap-3
              lg:flex-row lg:items-center lg:justify-between
            ">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  View
                </p>
                <h2 className="truncate text-xl font-semibold text-slate-950">
                  {state.data.title}
                </h2>
                {state.data.overview && (
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                    {state.data.overview}
                  </p>
                )}
              </div>

              <div className="
                flex flex-wrap gap-2
                lg:justify-end
              ">
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting}
                  className="
                    bg-primary text-primary-foreground shadow-nm-flat
                    hover:bg-primary/90
                  "
                  onClick={() => {
                    runAction(async () => {
                      const editableId = await ensureEditableCourseId();
                      router.push(`/instructor/courses/${editableId}/builder`);
                    }, 'Opening Editor...');
                  }}
                >
                  <Pencil className="mr-2 size-4" />
                  Edit Course
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  className="
                    text-slate-600
                    hover:bg-white/60 hover:text-slate-900
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
                        ? 'Course is now visible.'
                        : 'Course is now hidden.'
                    )
                  }
                >
                  {state.data.hidden ? (
                    <Eye className="mr-2 size-4" />
                  ) : (
                    <EyeOff className="mr-2 size-4" />
                  )}
                  {state.data.hidden ? 'Unhide course' : 'Hide course'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  className="
                    text-slate-500
                    hover:bg-red-50 hover:text-destructive
                  "
                  onClick={() =>
                    runAction(
                      () =>
                        deleteCourse({
                          client: apiClient,
                          path: { courseId },
                          throwOnError: true,
                        }),
                      'Course has been deleted.'
                    ).then((ok) => {
                      if (ok) {
                        router.push('/instructor/courses');
                      }
                    })
                  }
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete course
                </Button>
              </div>
            </div>
          </div>

          {actionError && <ErrorState error={actionError} />}
          
          <CourseCurriculumEditor
            courseId={courseId}
            course={state.data}
            reload={reload}
            readOnly={true}
            setCourse={() => undefined}
          />
        </div>
      )}
    </AppShell>
  );
}

export function InstructorCourseBuilderContent({
  viewer,
  courseId,
}: {
  viewer: Viewer;
  courseId: string;
}) {
  const router = useRouter();
  const { success: showToast } = useToast();
  const { state, reload, setState } = useCourseDetail(courseId);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setSubmitting(true);
    setActionError(null);
    try {
      await action();
      showToast(success);
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
      eyebrow="Management"
      title="Manage Course"
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-4">
          <div className="rounded-2xl bg-nm-bg/95 px-4 py-3 shadow-nm-flat-sm">
            <div className="
              flex flex-col gap-3
              lg:flex-row lg:items-center lg:justify-between
            ">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Curriculum Editor
                </p>
                <h2 className="truncate text-xl font-semibold text-slate-950">
                  {state.data.title}
                </h2>
              </div>

              <div className="
                flex flex-wrap gap-2
                lg:justify-end
              ">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" disabled={submitting}>
                      <Pencil className="mr-2 size-4" />
                      Edit basic info
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

                          const previousState = state.data;

                          setState({
                            status: 'ready',
                            data: {
                              ...previousState,
                              title: body.title,
                              price: body.price,
                              overview: body.overview,
                            }
                          });

                          const ok = await runAction(
                            async () => {
                              await updateCourse({
                                body,
                                client: apiClient,
                                path: { courseId: courseId },
                                throwOnError: true,
                              });
                            },
                            'Course has been updated.'
                          );

                          if (ok) {
                            setEditOpen(false);
                          } else {
                            setState({ status: 'ready', data: previousState });
                          }
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                {state.data.status === 'draft' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        disabled={submitting}
                        className="
                          bg-primary text-primary-foreground shadow-nm-flat
                          hover:bg-primary/90
                        "
                      >
                        <Send className="mr-2 size-4" />
                        Submit for Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Course for Review?</DialogTitle>
                        <DialogDescription>
                          Once submitted, your course will be reviewed by an administrator. You may not be able to edit it while it is pending review. Do you want to proceed?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 pt-4">
                        <DialogTrigger asChild>
                          <Button variant="outline" type="button" disabled={submitting}>
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button
                          type="button"
                          className="
                            bg-primary text-primary-foreground shadow-nm-flat
                            hover:bg-primary/90
                          "
                          disabled={submitting}
                          onClick={() => {
                            runAction(
                              async () => {
                                await submitCourse({
                                  client: apiClient,
                                  path: { courseId },
                                  throwOnError: true,
                                });
                                reload();
                                router.push('/instructor/courses');
                              },
                              'Course has been submitted for review.'
                            );
                          }}
                        >
                          Confirm & Submit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>

          {actionError && <ErrorState error={actionError} />}

          <CourseCurriculumEditor
            courseId={courseId}
            course={state.data}
            reload={reload}
            setCourse={(updater) => {
              setState((current) => {
                if (current.status !== 'ready') {
                  return current;
                }
                return {
                  ...current,
                  data: updater(current.data),
                };
              });
            }}
          />
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

export function InstructorCourseBuilderPage({ courseId }: { courseId: string }) {
  return (
    <AuthGate allowedRoles={['instructor', 'admin']}>
      {(viewer) => (
        <InstructorCourseBuilderContent viewer={viewer} courseId={courseId} />
      )}
    </AuthGate>
  );
}
