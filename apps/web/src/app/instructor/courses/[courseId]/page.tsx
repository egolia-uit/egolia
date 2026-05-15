'use client';

import { useParams } from 'next/navigation';

import { InstructorCourseDetailPage } from '#/features/course/components/course-pages';

export default function InstructorCourseDetailRoute() {
  const { courseId } = useParams<{ courseId: string }>();
  return <InstructorCourseDetailPage courseId={courseId} />;
}
