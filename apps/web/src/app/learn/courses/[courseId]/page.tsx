'use client';

import { useParams } from 'next/navigation';

import { LearnerCoursePage } from '#/features/course/components/course-pages';

export default function LearnerCourseRoute() {
  const { courseId } = useParams<{ courseId: string }>();
  return <LearnerCoursePage courseId={courseId} />;
}
