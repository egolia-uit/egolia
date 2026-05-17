'use client';

import { Eye, EyeOff, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Button } from '#/components/ui/neumorphism/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/neumorphism/card';
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
  type CourseCourseDetail,
  type CourseCourseWritable,
  createCourse,
  createDraftVersion,
  deleteCourse,
  getCourseForUpdate,
  getMyCourses,
  hideCourse,
  unhideCourse,
  updateCourse,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import type { Viewer } from '#/lib/auth/roles';

import { CourseHero } from './course-detail';
import { CourseCurriculumEditor } from './course-curriculum-editor';
import { CourseForm } from './course-form';
import { CourseGridSkeleton, ErrorState, InlineNotice } from './course-states';
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
                onUploadIntroductionVideo={(file, onProgress) => uploadCourseVideo('new', file, onProgress)}
                onSubmit={create}
              />
            </div>
          </DialogContent>
        </Dialog>
      }
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
                    course.hidden ? 'Khóa học đã hiện.' : 'Khóa học đã ẩn.'
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
                    'Khóa học đã được xóa.'
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
  const { state, reload, setState } = useCourseDetail(courseId);
  const [actionError, setActionError] = useState<ApiProblem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const setCourse = useCallback(
    (updater: (course: CourseCourseDetail) => CourseCourseDetail) => {
      setState((current) =>
        current.status === 'ready'
          ? {
              status: 'ready',
              data: updater(current.data),
            }
          : current
      );
    },
    [setState]
  );

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
                      className="w-full"
                    >
                      <Pencil className="mr-2 size-4" />
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
                  className="w-full"
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
                    <Eye className="mr-2 size-4" />
                  ) : (
                    <EyeOff className="mr-2 size-4" />
                  )}
                  {state.data.hidden ? 'Unhide course' : 'Hide course'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={submitting}
                  className="w-full"
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
                  <Trash2 className="mr-2 size-4" />
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
              <CourseCurriculumEditor
                course={state.data}
                courseId={courseId}
                reload={reload}
                setCourse={setCourse}
              />
            </div>

            <div className="grid gap-4">
              <Card className="bg-nm-bg">
                <CardHeader>
                  <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
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
