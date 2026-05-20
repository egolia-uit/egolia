import { BlogListPage } from '#/features/blog';

export const metadata = {
  title: 'Blog - Egolia',
  description: 'News and guides from Egolia',
};

export default function BlogRoute() {
  return <BlogListPage />;
}
