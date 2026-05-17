'use client';

import { useParams } from 'next/navigation';

import { PublicCoursePage } from '#/features/course/components/course-pages';

export default function CourseLandingPage() {
  const { courseId } = useParams<{ courseId: string }>();
  return <PublicCoursePage courseId={courseId} />;
}
