import { LearnerHomePage } from '#/features/course/components/course-pages';

export const metadata = {
  title: 'My Learning - Egolia',
  description: 'Learner workspace for Egolia courses',
};

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <LearnerHomePage initialTab={params.tab} />;
}
