'use client';

import {
  BookOpen,
  CheckCircle,
  Eye,
  EyeOff,
  FilePlus2,
  GraduationCap,
  Pencil,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { AuthGate } from '#/components/layout/auth-gate';
import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import { useToast } from '#/components/ui/neumorphism/toast';
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
import { formatVnd } from '#/lib/api/format';
import type { Viewer } from '#/lib/auth/roles';

import { CourseCurriculumEditor } from './course-curriculum-editor';
import { CourseForm } from './course-form';
import {
  ListContent,
  type ResourceState,
  isDraftLike,
  normalizeTab,
  uploadCourseVideo,
  useCourseDetail,
  useCourseList,
} from './course-shared';
import { CourseGridSkeleton, ErrorState } from './course-states';
import { CourseVideoPlayer } from './course-video-player';

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
                onUploadIntroductionVideo={(file, onProgress) =>
                  uploadCourseVideo(crypto.randomUUID(), file, onProgress)
                }
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

function statusLabel(status?: string) {
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

function statusVariant(status?: string): 'inset' | 'warning' | 'secondary' {
  switch (status) {
    case 'approved':
      return 'inset';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
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
  const [activeTab, setActiveTab] = useState<'curriculum' | 'students'>('curriculum');

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

    // Try to get the existing draft first to avoid 400 error from createDraftVersion
    try {
      const { data } = await getCourseForUpdate({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
        cache: 'no-store',
      });
      return data.data.id ?? courseId;
    } catch (error) {
      // Draft not found or other error, let's try to create a new draft
      await createDraftVersion({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
      });

      // Get the draft again now that we created it
      const { data } = await getCourseForUpdate({
        client: apiClient,
        path: { courseId },
        throwOnError: true,
        cache: 'no-store',
      });
      return data.data.id ?? courseId;
    }
  }

  return (
    <AppShell viewer={viewer} eyebrow="Management" title="Course Detail">
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <div
            className="
              grid gap-6
              lg:grid-cols-3
            "
          >
            {/* Info and Actions */}
            <div
              className="
                flex flex-col justify-between rounded-2xl border
                border-slate-200/60 bg-white/95 p-6
                shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
                lg:col-span-2
              "
            >
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(state.data.status)}>
                      {statusLabel(state.data.status)}
                    </Badge>
                    {state.data.hidden && (
                      <Badge variant="secondary">
                        <EyeOff className="mr-1 size-3" />
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <h2
                    className="
                      text-2xl leading-snug font-bold tracking-tight
                      text-slate-950
                    "
                  >
                    {state.data.title}
                  </h2>
                </div>

                {state.data.overview ? (
                  <p className="text-sm/6 text-slate-600">
                    {state.data.overview}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No overview description provided yet.
                  </p>
                )}

                <div
                  className="
                    flex flex-wrap items-center gap-6 border-t border-b
                    border-slate-100 py-3 text-sm
                  "
                >
                  <div>
                    <span className="font-medium text-slate-500">Price: </span>
                    <span className="font-bold text-slate-900">
                      {formatVnd(state.data.price)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Status: </span>
                    <span className="font-semibold text-slate-700 capitalize">
                      {state.data.status ?? 'draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
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
                    hover:bg-slate-50 hover:text-slate-900
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

            {/* Intro Video / Thumbnail Preview Card */}
            <div
              className="
                flex flex-col justify-between rounded-2xl border
                border-slate-200/60 bg-white/95 p-5
                shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
              "
            >
              <div className="space-y-3">
                <h3
                  className="
                    flex items-center gap-1.5 text-sm font-bold tracking-wider
                    text-slate-800 uppercase
                  "
                >
                  <BookOpen className="size-4 text-indigo-500" />
                  Intro Video Preview
                </h3>
                {state.data.introductionVideoUrl ? (
                  <div
                    className="
                      relative aspect-video overflow-hidden rounded-xl border
                      border-slate-100/50 bg-slate-950 shadow-sm
                    "
                  >
                    <CourseVideoPlayer
                      src={state.data.introductionVideoUrl}
                      title={state.data.title}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <div
                    className="
                      flex aspect-video w-full flex-col items-center
                      justify-center gap-2 rounded-xl border border-dashed
                      border-slate-200 bg-slate-50/50 p-4 text-center
                    "
                  >
                    <div
                      className="
                        rounded-full border border-slate-200 bg-white p-2
                        shadow-xs
                      "
                    >
                      <BookOpen className="size-6 text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      No introduction video uploaded
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Click edit course to upload in the builder
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center text-xs text-slate-500">
                This video is displayed on the landing page for prospective
                students.
              </div>
            </div>
          </div>

          {actionError && <ErrorState error={actionError} />}

          {/* Premium Segmented Tabs Toggle */}
          <div className="flex justify-center border-b border-slate-200 pb-4">
            <div className="flex rounded-xl bg-slate-100/80 p-1 shadow-inner border border-slate-200/50">
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  activeTab === 'curriculum'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="size-3.5" />
                Course Curriculum
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                  activeTab === 'students'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="size-3.5" />
                Enrolled Students & Stats
              </button>
            </div>
          </div>

          {activeTab === 'students' ? (
            <EnrolledStudentsPanel />
          ) : (
            <CourseCurriculumEditor
              courseId={courseId}
              course={state.data}
              reload={reload}
              readOnly={true}
              setCourse={() => undefined}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}

const MOCK_STUDENTS = [
  {
    id: 's1',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    enrolledAt: '2026-05-02T10:15:00Z',
    progress: 100,
    status: 'completed',
  },
  {
    id: 's2',
    name: 'Michael Smith',
    email: 'michael.smith@student.edu',
    enrolledAt: '2026-05-10T14:30:00Z',
    progress: 78,
    status: 'active',
  },
  {
    id: 's3',
    name: 'David Johnson',
    email: 'david.j@gmail.com',
    enrolledAt: '2026-05-12T08:00:00Z',
    progress: 45,
    status: 'active',
  },
  {
    id: 's4',
    name: 'Sarah Williams',
    email: 'sarah.w@egolia.edu.vn',
    enrolledAt: '2026-05-18T16:20:00Z',
    progress: 12,
    status: 'active',
  },
];

function EnrolledStudentsPanel() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = MOCK_STUDENTS.length;
    const completed = MOCK_STUDENTS.filter((s) => s.progress === 100).length;
    const averageProgress = Math.round(
      MOCK_STUDENTS.reduce((acc, curr) => acc + curr.progress, 0) / (total || 1)
    );
    return { total, completed, averageProgress };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="
        grid gap-4
        md:grid-cols-3
      ">
        <Card className="border border-slate-200 bg-white">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="
              flex size-11 items-center justify-center rounded-xl bg-blue-50
              text-blue-600
            ">
              <Users className="size-5" />
            </div>
            <div>
              <div className="
                text-xs font-semibold tracking-wider text-slate-500 uppercase
              ">
                Enrolled Students
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="
              flex size-11 items-center justify-center rounded-xl bg-emerald-50
              text-emerald-600
            ">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="
                text-xs font-semibold tracking-wider text-slate-500 uppercase
              ">
                Completed
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.completed}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="
              flex size-11 items-center justify-center rounded-xl bg-violet-50
              text-violet-600
            ">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="
                text-xs font-semibold tracking-wider text-slate-500 uppercase
              ">
                Avg. Progress
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.averageProgress}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List */}
      <Card className="border border-slate-200 bg-white">
        <CardHeader className="
          flex flex-col gap-3 border-b border-slate-100 pb-3
          sm:flex-row sm:items-center sm:justify-between
        ">
          <CardTitle className="text-base font-semibold text-slate-900">
            Student Roster ({filteredStudents.length})
          </CardTitle>
          {/* Search bar */}
          <div className="
            relative w-full
            sm:w-72
          ">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3
                pl-8 text-sm
                focus:border-blue-500 focus:outline-hidden
              "
            />
            <Search className="
              absolute top-2.5 left-2.5 size-3.5 text-slate-400
            " />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto py-2">
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="
                          flex size-9 items-center justify-center rounded-full
                          bg-slate-100 font-bold text-slate-700
                        ">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            {student.name}
                          </div>
                          <div className="text-xs font-medium text-slate-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600">
                      {new Date(student.enrolledAt).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell className="w-1/3">
                      <div className="space-y-1">
                        <div className="
                          flex items-center justify-between text-xs
                          font-semibold text-slate-600
                        ">
                          <span>{student.progress}%</span>
                        </div>
                        <div className="
                          h-2 w-full overflow-hidden rounded-full border
                          border-slate-200/50 bg-slate-100
                        ">
                          <div
                            className={`
                              h-full rounded-full transition-all duration-300
                              ${
                              student.progress === 100
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }
                            `}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.progress === 100 ? (
                        <Badge className="
                          flex w-fit items-center gap-1 bg-emerald-100
                          text-emerald-700
                        ">
                          <CheckCircle className="size-3" />
                          Certified
                        </Badge>
                      ) : (
                        <Badge className="
                          flex w-fit items-center gap-1 bg-blue-100
                          text-blue-700
                        ">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              No students found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
  const [isEditingBasic, setIsEditingBasic] = useState(false);

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
    <AppShell viewer={viewer} eyebrow="Management" title="Manage Course">
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && (
        <ErrorState error={state.error} onRetry={reload} />
      )}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          {/* Collapsible/Inline Edit Basic Info & Media Preview Panel */}
          <div
            className="
              rounded-2xl border border-slate-200/60 bg-white/95 p-6
              shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
              transition-all duration-300
            "
          >
            {!isEditingBasic ? (
              // View Mode
              <div
                className="
                  grid gap-6
                  md:grid-cols-3
                "
              >
                {/* Text Details */}
                <div
                  className="
                    flex flex-col justify-between
                    md:col-span-2
                  "
                >
                  <div className="space-y-4">
                    <div>
                      <span
                        className="
                          text-xs font-semibold tracking-wide text-blue-600
                          uppercase
                        "
                      >
                        Basic Information
                      </span>
                      <h2
                        className="
                          mt-1 text-2xl leading-snug font-bold tracking-tight
                          text-slate-950
                        "
                      >
                        {state.data.title}
                      </h2>
                    </div>

                    {state.data.overview ? (
                      <p className="text-sm/6 text-slate-600">
                        {state.data.overview}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        No overview description provided yet.
                      </p>
                    )}

                    <div
                      className="
                        flex flex-wrap items-center gap-6 border-t
                        border-slate-100 pt-4 text-sm
                      "
                    >
                      <div>
                        <span className="font-medium text-slate-500">
                          Price:{' '}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatVnd(state.data.price)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500">
                          Status:{' '}
                        </span>
                        <span
                          className="font-semibold text-slate-700 capitalize"
                        >
                          {state.data.status ?? 'draft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={submitting}
                      onClick={() => setIsEditingBasic(true)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit basic info
                    </Button>

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
                              Once submitted, your course will be reviewed by an
                              administrator. You may not be able to edit it
                              while it is pending review. Do you want to
                              proceed?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2 pt-4">
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                type="button"
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <Button
                              type="button"
                              className="
                                bg-primary text-primary-foreground
                                shadow-nm-flat
                                hover:bg-primary/90
                              "
                              disabled={submitting}
                              onClick={() => {
                                runAction(async () => {
                                  await submitCourse({
                                    client: apiClient,
                                    path: { courseId },
                                    throwOnError: true,
                                  });
                                  reload();
                                  router.push('/instructor/courses');
                                }, 'Course has been submitted for review.');
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

                {/* Playable Video Preview */}
                <div
                  className="
                    flex flex-col justify-between rounded-xl border
                    border-slate-100 bg-slate-50/50 p-4
                  "
                >
                  <div className="space-y-3">
                    <h3
                      className="
                        flex items-center gap-1.5 text-sm font-bold
                        tracking-wider text-slate-800 uppercase
                      "
                    >
                      <BookOpen className="size-4 text-indigo-500" />
                      Intro Video Preview
                    </h3>
                    {state.data.introductionVideoUrl ? (
                      <div
                        className="
                          relative aspect-video overflow-hidden rounded-xl
                          border border-slate-100/50 bg-slate-950 shadow-sm
                        "
                      >
                        <CourseVideoPlayer
                          src={state.data.introductionVideoUrl}
                          title={state.data.title}
                          className="h-full w-full"
                        />
                      </div>
                    ) : (
                      <div
                        className="
                          flex aspect-video w-full flex-col items-center
                          justify-center gap-2 rounded-xl border border-dashed
                          border-slate-200 bg-white p-4 text-center
                        "
                      >
                        <div
                          className="
                            rounded-full border border-slate-200 bg-slate-50 p-2
                            shadow-xs
                          "
                        >
                          <BookOpen className="size-6 text-slate-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          No intro video uploaded
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Click edit basic info to upload below
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode (Inline Form & Video Preview side by side!)
              <div
                className="
                  grid gap-6
                  md:grid-cols-3
                "
              >
                {/* Form column */}
                <div
                  className="
                    space-y-4
                    md:col-span-2
                  "
                >
                  <div
                    className="
                      flex items-center justify-between border-b
                      border-slate-100 pb-3
                    "
                  >
                    <div>
                      <span
                        className="
                          text-xs font-semibold tracking-wide text-blue-600
                          uppercase
                        "
                      >
                        Edit Mode
                      </span>
                      <h3 className="text-lg font-bold text-slate-950">
                        Edit Basic Info
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingBasic(false)}
                      className="
                        text-slate-500
                        hover:bg-slate-100
                      "
                    >
                      Cancel
                    </Button>
                  </div>

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
                        },
                      });

                      const ok = await runAction(async () => {
                        await updateCourse({
                          body,
                          client: apiClient,
                          path: { courseId: courseId },
                          throwOnError: true,
                        });
                      }, 'Course has been updated.');

                      if (ok) {
                        setIsEditingBasic(false);
                      } else {
                        setState({ status: 'ready', data: previousState });
                      }
                    }}
                  />
                </div>

                {/* Active intro video preview next to it */}
                <div
                  className="
                    flex flex-col justify-between rounded-xl border
                    border-slate-100 bg-slate-50/50 p-4
                  "
                >
                  <div className="space-y-3">
                    <h3
                      className="
                        flex items-center gap-1.5 text-sm font-bold
                        tracking-wider text-slate-800 uppercase
                      "
                    >
                      <BookOpen className="size-4 text-indigo-500" />
                      Active Video
                    </h3>
                    {state.data.introductionVideoUrl ? (
                      <div
                        className="
                          relative aspect-video overflow-hidden rounded-xl
                          border border-slate-100/50 bg-slate-950 shadow-sm
                        "
                      >
                        <CourseVideoPlayer
                          src={state.data.introductionVideoUrl}
                          title={state.data.title}
                          className="h-full w-full"
                        />
                      </div>
                    ) : (
                      <div
                        className="
                          flex aspect-video w-full flex-col items-center
                          justify-center gap-2 rounded-xl border border-dashed
                          border-slate-200 bg-white p-4 text-center
                        "
                      >
                        <div
                          className="
                            rounded-full border border-slate-200 bg-slate-50 p-2
                            shadow-xs
                          "
                        >
                          <BookOpen className="size-6 text-slate-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          No intro video uploaded
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Use the form on the left to upload a video
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className="
                      mt-4 text-center text-[11px] text-slate-400 italic
                    "
                  >
                    Changes to title/price/overview are saved immediately when
                    clicking Save. Video uploads are auto-processed.
                  </div>
                </div>
              </div>
            )}
          </div>

          {actionError && <ErrorState error={actionError} />}

          <div className="mt-8">
            <h3 className="mb-4 text-xl font-bold tracking-tight text-slate-900">
              Curriculum Builder
            </h3>
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

export function InstructorCourseBuilderPage({
  courseId,
}: {
  courseId: string;
}) {
  return (
    <AuthGate allowedRoles={['instructor', 'admin']}>
      {(viewer) => (
        <InstructorCourseBuilderContent viewer={viewer} courseId={courseId} />
      )}
    </AuthGate>
  );
}
