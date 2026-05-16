import { AdminCoursesPage } from '#/features/course/components/course-pages';

export const metadata = {
  title: 'Admin Courses - Egolia',
  description: 'Admin course overview',
};

export default async function AdminCoursesRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <AdminCoursesPage initialTab={params.tab} />;
}
