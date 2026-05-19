'use client';

import { useParams } from 'next/navigation';

import { InstructorCourseBuilderPage } from '#/features/course/components/course-pages';

export default function InstructorCourseBuilderRoute() {
  const { courseId } = useParams<{ courseId: string }>();
  return <InstructorCourseBuilderPage courseId={courseId} />;
}
