import { Suspense } from 'react';
import { DashboardRedirectPage } from '#/features/course/components/course-pages';
import { CourseGridSkeleton } from '#/features/course/components/course-states';

export const metadata = {
  title: 'Dashboard - Egolia',
  description: 'Route users to the right Egolia workspace',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<CourseGridSkeleton />}>
      <DashboardRedirectPage />
    </Suspense>
  );
}
