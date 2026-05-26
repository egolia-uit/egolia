'use client';

import {
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
import { Card, CardContent } from '#/components/ui/neumorphism/card';
import { Input } from '#/components/ui/neumorphism/input';
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
  approveCourse,
  declineCourse,
  getSystemCourses,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatVnd } from '#/lib/api/format';
import type { Viewer } from '#/lib/auth/roles';

import {
  MockPanel,
  isPendingLike,
  normalizeTab,
  useCourseList,
} from './course-shared';
import {
  CourseGridSkeleton,
  EmptyState,
  ErrorState,
  InlineNotice,
} from './course-states';

type CourseWithInstructor = CourseCourse & {
  instructorName?: string;
  instructorUsername?: string;
  instructor?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
};

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

  const rows = useMemo(() => {
    if (courses.state.status !== 'ready') {
      return [];
    }

    if (activeTab === 'pending') {
      return courses.state.data.data.filter(isPendingLike);
    }

    return courses.state.data.data;
  }, [activeTab, courses.state]);

  async function mutateAdminCourse(
    action: () => Promise<unknown>,
    success: string
  ) {
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
      eyebrow="Administration"
      title="Manage System Courses"
      actions={
        <Button type="button" variant="outline" onClick={courses.reload}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      }
    >
      {actionMessage && (
        <InlineNotice title="Success" description={actionMessage} />
      )}

      {activeTab === 'archive' && (
        <MockPanel
          title="Hidden courses"
          description="Mock view vi BE hien chua co archive pagination rieng."
          items={['Hidden courses summary.', 'Restore flow placeholder.']}
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
          <Card className="mb-6 bg-nm-bg shadow-nm-flat">
            <CardContent
              className="
                flex flex-col gap-3 py-4
                md:flex-row
              "
            >
              <div className="relative flex-1">
                <Search
                  className="
                    pointer-events-none absolute top-1/2 left-4 size-4
                    -translate-y-1/2 text-muted-foreground
                  "
                />
                <Input
                  className="pl-10"
                  placeholder="Search system courses"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setSubmittedQuery(query.trim());
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={() => setSubmittedQuery(query.trim())}
              >
                <Search className="mr-2 size-4" />
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
              title="No courses available"
              description="No course data in the system."
            />
          )}
          {courses.state.status === 'ready' && rows.length > 0 && (
            <Card className="bg-nm-bg shadow-nm-flat">
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
                        <TableCell className="max-w-96 whitespace-normal">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                relative aspect-video w-20 shrink-0
                                overflow-hidden rounded-lg border
                                border-slate-100/60 bg-gradient-to-br
                                from-blue-50/80 to-slate-50/80
                              "
                            >
                              {course.introductionVideoUrl ? (
                                <video
                                  className="h-full w-full object-cover"
                                  src={`${course.introductionVideoUrl}#t=0.001`}
                                  muted
                                  preload="metadata"
                                />
                              ) : (
                                <div
                                  className="
                                    flex h-full w-full items-center
                                    justify-center
                                  "
                                >
                                  <BookOpen className="size-4 text-indigo-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div
                                className="
                                  leading-snug font-semibold text-slate-900
                                "
                              >
                                {course.title}
                              </div>
                              <div
                                className="
                                  mt-0.5 line-clamp-1 text-xs text-slate-500
                                "
                              >
                                {course.overview || 'No overview'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.status === 'approved'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {course.status ?? 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.hidden ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{formatVnd(course.price)}</TableCell>
                        <TableCell>{instructorDisplayName(course)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {isPendingLike(course) && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="
                                        bg-primary text-primary-foreground
                                        shadow-nm-flat
                                        hover:bg-primary/90
                                      "
                                    >
                                      <CheckCircle2 className="mr-1.5 size-4" />
                                      Approve
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Approve Course?</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to approve this
                                        course? Once approved, it will be
                                        available to students according to its
                                        visibility settings.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2 pt-4">
                                      <DialogTrigger asChild>
                                        <Button variant="outline" type="button">
                                          Cancel
                                        </Button>
                                      </DialogTrigger>
                                      <DialogTrigger asChild>
                                        <Button
                                          type="button"
                                          className="
                                            bg-primary text-primary-foreground
                                            shadow-nm-flat
                                            hover:bg-primary/90
                                          "
                                          onClick={() =>
                                            mutateAdminCourse(
                                              () =>
                                                approveCourse({
                                                  client: apiClient,
                                                  path: {
                                                    courseId: course.id ?? '',
                                                  },
                                                  throwOnError: true,
                                                }),
                                              'Course has been approved.'
                                            )
                                          }
                                        >
                                          Confirm Approve
                                        </Button>
                                      </DialogTrigger>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                    >
                                      <XCircle className="mr-1.5 size-4" />
                                      Decline
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Decline Course?</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to decline this
                                        course? The instructor will be notified
                                        to make changes.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2 pt-4">
                                      <DialogTrigger asChild>
                                        <Button variant="outline" type="button">
                                          Cancel
                                        </Button>
                                      </DialogTrigger>
                                      <DialogTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          onClick={() =>
                                            mutateAdminCourse(
                                              () =>
                                                declineCourse({
                                                  client: apiClient,
                                                  path: {
                                                    courseId: course.id ?? '',
                                                  },
                                                  throwOnError: true,
                                                }),
                                              'Course has been rejected.'
                                            )
                                          }
                                        >
                                          Confirm Decline
                                        </Button>
                                      </DialogTrigger>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}

                            {course.status === 'approved' && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="
                                  text-slate-600
                                  hover:bg-slate-100 hover:text-slate-900
                                "
                                onClick={() =>
                                  mutateAdminCourse(
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
                                    course.hidden
                                      ? 'Course is now visible.'
                                      : 'Course is now hidden.'
                                  )
                                }
                              >
                                {course.hidden ? (
                                  <Eye className="mr-1.5 size-4" />
                                ) : (
                                  <EyeOff className="mr-1.5 size-4" />
                                )}
                                {course.hidden ? 'Unhide' : 'Hide'}
                              </Button>
                            )}

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="
                                    text-slate-500
                                    hover:bg-red-50 hover:text-destructive
                                  "
                                >
                                  <Trash2 className="mr-1.5 size-4" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Course?</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete{' '}
                                    <strong>{course.title}</strong>? This action
                                    is permanent and cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2 pt-4">
                                  <DialogTrigger asChild>
                                    <Button variant="outline" type="button">
                                      Cancel
                                    </Button>
                                  </DialogTrigger>
                                  <DialogTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      onClick={() =>
                                        mutateAdminCourse(
                                          () =>
                                            deleteCourse({
                                              client: apiClient,
                                              path: {
                                                courseId: course.id ?? '',
                                              },
                                              throwOnError: true,
                                            }),
                                          'Course has been deleted.'
                                        )
                                      }
                                    >
                                      Confirm Delete
                                    </Button>
                                  </DialogTrigger>
                                </div>
                              </DialogContent>
                            </Dialog>
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
