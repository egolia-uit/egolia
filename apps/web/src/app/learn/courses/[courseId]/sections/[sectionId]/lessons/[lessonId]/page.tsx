'use client';

import { useParams } from 'next/navigation';

import { LearnerLessonPage } from '#/features/course/components/course-learner';

export default function LearnerLessonRoute() {
  const { courseId, lessonId, sectionId } = useParams<{
    courseId: string;
    lessonId: string;
    sectionId: string;
  }>();

  return (
    <LearnerLessonPage
      courseId={courseId}
      lessonId={lessonId}
      sectionId={sectionId}
    />
  );
}
