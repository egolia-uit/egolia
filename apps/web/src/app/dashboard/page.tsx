import { DashboardRedirectPage } from '#/features/course/components/course-pages';

export const metadata = {
  title: 'Dashboard - Egolia',
  description: 'Route users to the right Egolia workspace',
};

export default function DashboardPage() {
  return <DashboardRedirectPage />;
}
