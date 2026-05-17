import { MarketplacePage } from '#/features/course/components/course-pages';

export const metadata = {
  title: 'Courses - Egolia',
  description: 'Browse published Egolia courses',
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <MarketplacePage initialTab={params.tab} />;
}
