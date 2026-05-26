'use client';

import { BookOpen, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import {
  type DependencyList,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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
import { apiClient } from '#/lib/api';
import {
  type CourseCourse,
  type CourseCourseDetail,
  type CourseReview,
  getCourseDetail,
  getCourseReviews,
  getUploadVideoUrl,
} from '#/lib/api/course';
import { type ApiProblem, normalizeApiError } from '#/lib/api/errors';
import { formatDateTime } from '#/lib/api/format';
import { putFileToSignedUrl } from '#/lib/api/upload';

import { CourseCard } from './course-card';
import { CourseGridSkeleton, EmptyState, ErrorState } from './course-states';

export function VideoDropZone({
  id,
  onChange,
  onInvalidFile,
}: {
  id: string;
  onChange: (file: File | null) => void;
  onInvalidFile?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFile = useCallback(
    (file: File | null) => {
      if (file && file.type.startsWith('video/')) {
        onChange(file);
      } else if (file) {
        onInvalidFile?.();
        onChange(null);
      }
    },
    [onChange, onInvalidFile]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors',
        isDraggingOver
          ? 'border-blue-400 bg-blue-50 text-blue-600'
          : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
      )}
      onClick={() => inputRef.current?.click()}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <UploadCloud
        className={cn(
          'size-8 transition-colors',
          isDraggingOver ? 'text-blue-500' : 'text-slate-400'
        )}
      />
      <p className="text-center text-sm font-medium">
        {isDraggingOver
          ? 'Thả file vào đây'
          : 'Kéo thả hoặc click để chọn file video'}
      </p>
      <p className="text-xs text-slate-400">MP4, MOV, AVI, WebM…</p>
      <input
        ref={inputRef}
        accept="video/*"
        className="hidden"
        id={id}
        type="file"
        onChange={onInputChange}
      />
    </div>
  );
}

export type ResourceState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: ApiProblem };

export type CourseListResponse = {
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

export type CourseReviewsResponse = {
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

export type UploadProgressCallback = (progress: number) => void;

export function normalizeTab(value: string | undefined, allowed: string[]) {
  return value && allowed.includes(value) ? value : allowed[0];
}

export function courseStatusLabel(course: CourseCourse) {
  return course.status ?? 'draft';
}

export function isDraftLike(course: CourseCourse) {
  return courseStatusLabel(course) === 'draft';
}

export function isPendingLike(course: CourseCourse) {
  return courseStatusLabel(course) === 'pending';
}

export function MockPanel({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Mock</Badge>
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent
        className="
          grid gap-3
          md:grid-cols-2
        "
      >
        {items.map((item) => (
          <div
            key={item}
            className="
              rounded-xl border border-slate-200/60 bg-slate-50 p-4 text-sm
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

export function RoleTabs({
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
    <div
      className="
        flex gap-1 overflow-x-auto rounded-xl border border-slate-200/60
        bg-slate-100/70 p-1
      "
    >
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          asChild
          size="sm"
          variant={active === tab.value ? 'inset' : 'ghost'}
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

export async function uploadCourseVideo(
  courseId: string,
  file: File,
  onProgress?: UploadProgressCallback
) {
  console.log('>>> START uploadCourseVideo');
  console.log('>>> courseId:', courseId);
  console.log('>>> File:', file.name, file.size, file.type);

  try {
    console.log('>>> Calling getUploadVideoUrl...');
    const { data } = await getUploadVideoUrl({
      body: { videoFilename: file.name },
      client: apiClient,
      throwOnError: true,
      responseValidator: async (data: any) => data,
    });

    console.log('>>> Backend response data:', data);

    if (!data.uploadUrl) {
      console.error('>>> No uploadUrl in response!');
      throw new Error('Backend did not return uploadUrl');
    }

    console.log('>>> Initiating PUT to RustFS:', data.uploadUrl);
    await putFileToSignedUrl(data.uploadUrl, file, onProgress);
    console.log('>>> PUT Completed!');
    return data;
  } catch (error) {
    console.error('>>> FATAL ERROR in uploadCourseVideo:', error);
    throw error;
  }
}

export function useCourseList(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { state, reload };
}

export function useCourseDetail(courseId: string) {
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
      cache: 'no-store',
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

export function useCourseReviews(courseId: string) {
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
      responseValidator: async (data: any) => data,
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

export function ResultMeta({ result }: { result: CourseListResponse }) {
  return (
    <div className="text-sm text-slate-500">
      {result.pagination.total} courses · page {result.pagination.page}/
      {Math.max(result.pagination.totalPages, 1)}
    </div>
  );
}

export function CourseGrid({
  courses,
  destination,
  actionFor,
  onRefresh,
}: {
  courses: CourseCourse[];
  destination?: 'public' | 'learner' | 'instructor';
  actionFor?: (course: CourseCourse) => ReactNode;
  onRefresh?: () => void;
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
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

export function ListContent({
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
        onRefresh={reload}
      />
    </div>
  );
}

export function CourseReviewsPanel({
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
        title="No reviews yet"
        description="This course has no reviews yet."
      />
    );
  }

  return (
    <Card>
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
            className="rounded-xl border border-slate-200/60 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium text-slate-900">
                Rating {review.rating}/5
              </div>
              <div className="text-xs text-slate-500">
                {formatDateTime(review.createdAt)}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
            <p className="mt-2 text-xs text-slate-500">User: {review.userId}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
