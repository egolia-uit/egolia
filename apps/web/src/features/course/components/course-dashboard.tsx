'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppShell } from '#/components/layout/app-shell';
import { useViewer } from '#/lib/auth/use-viewer';
import { CourseGridSkeleton } from './course-states';

export function DashboardRedirectPage() {
  const router = useRouter();
  const { viewer, loading } = useViewer();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!viewer?.id && !viewer?.accessToken) {
      router.replace('/login');
      return;
    }
    if (viewer?.roles.includes('admin')) {
      router.replace('/admin/courses');
      return;
    }
    if (viewer?.roles.includes('instructor')) {
      router.replace('/instructor/courses');
      return;
    }
    router.replace('/courses');
  }, [loading, router, viewer]);

  return (
    <AppShell
      viewer={viewer}
      eyebrow=""
      title="Đang chuyển hướng..."
    >
      <CourseGridSkeleton />
    </AppShell>
  );
}
