'use client';

import { useParams } from 'next/navigation';

import { BlogDetailPage } from '#/features/blog';

export default function BlogDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <BlogDetailPage slug={slug} />;
}
