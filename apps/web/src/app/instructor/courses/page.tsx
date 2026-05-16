import { InstructorCoursesPage } from '#/features/course/components/course-pages';

export const metadata = {
  title: 'Teaching - Egolia',
  description: 'Instructor course management',
};

export default async function InstructorCoursesRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <InstructorCoursesPage initialTab={params.tab} />;
}
