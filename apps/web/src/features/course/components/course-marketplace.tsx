'use client';

import { BookOpen, Filter, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { Button } from '#/components/ui/neumorphism/button';
import { Card, CardContent } from '#/components/ui/neumorphism/card';
import { Input } from '#/components/ui/neumorphism/input';
import { apiClient } from '#/lib/api';
import { type CourseCourse, getCourseLandingPage, getPublishedCourses } from '#/lib/api/course';
import { normalizeApiError } from '#/lib/api/errors';
import { routeForViewer } from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

import { CourseHero } from './course-detail';
import { CourseGridSkeleton, ErrorState } from './course-states';
import { CourseReviewsPanel, ListContent, type ResourceState, useCourseList, useCourseReviews } from './course-shared';

export function MarketplacePage({
  initialTab = 'marketplace',
}: {
  initialTab?: string;
}) {
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
      eyebrow="Khám phá"
      title="Khám phá khóa học"
      actions={
        <Button type="button" variant="outline" onClick={reload}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      }
    >
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
              placeholder="Tìm khóa học theo tên hoặc mô tả"
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
            <Filter className="mr-2 size-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <ListContent
        state={state}
        reload={reload}
        destination="public"
        emptyTitle="Chưa có khóa học"
        emptyDescription="Chưa có khóa học nào được xuất bản."
      />
    </AppShell>
  );
}

export function PublicCoursePage({ courseId }: { courseId: string }) {
  const { viewer } = useViewer();
  const primaryHref = viewer?.id ? routeForViewer(viewer) : '/login';
  const primaryLabel = viewer?.id ? 'Mở dashboard' : 'Sign in để học';
  const reviews = useCourseReviews(courseId);
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
      eyebrow="Chi tiết khóa học"
      title="Tổng quan khóa học"
    >
      {state.status === 'loading' && <CourseGridSkeleton />}
      {state.status === 'error' && <ErrorState error={state.error} />}
      {state.status === 'ready' && (
        <div className="grid gap-6">
          <CourseHero
            course={state.data}
            actions={
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href={primaryHref}>
                    <BookOpen className="mr-2 size-4" />
                    {primaryLabel}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/courses">Back to marketplace</Link>
                </Button>
              </div>
            }
          />
          <CourseReviewsPanel state={reviews.state} reload={reviews.reload} />
        </div>
      )}
    </AppShell>
  );
}
