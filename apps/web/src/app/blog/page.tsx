import { BlogListPage } from '#/features/blog';

export const metadata = {
  title: 'Blog - Egolia',
  description: 'Tin tức và hướng dẫn từ Egolia',
};

export default function BlogRoute() {
  return <BlogListPage />;
}
