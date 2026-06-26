'use client';

import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import type { CourseCourse, CourseCourseDetail } from '#/lib/api/course';
import { formatDuration, formatVnd } from '#/lib/api/format';

import { CourseVideoPlayer } from './course-video-player';

type CourseWithInstructor = CourseCourse & {
  instructorName?: string;
  instructorUsername?: string;
  instructor?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
};

function instructorDisplayName(course: CourseCourse) {
  const value = course as CourseWithInstructor;
  return (
    value.instructorName ||
    value.instructor?.name ||
    value.instructorUsername ||
    value.instructor?.username ||
    value.instructor?.email ||
    'Instructor'
  );
}

export function CourseHero({
  course,
  actions,
}: {
  course: CourseCourse;
  actions?: ReactNode;
}) {
  return (
    <section
      className="
        grid gap-4
        lg:grid-cols-[1fr_340px]
      "
    >
      {/* Main content card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-950">
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {course.introductionVideoUrl && (
            <CourseVideoPlayer
              src={course.introductionVideoUrl}
              title={`${course.title} introduction`}
              className="mb-5"
            />
          )}
          <p className="max-w-3xl text-sm/6 text-slate-600">
            {course.overview || 'Course does not have an overview yet.'}
          </p>
        </CardContent>
      </Card>

      {/* Study plan / snapshot card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Course snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div
              className="
                text-xs font-medium tracking-wide text-slate-400 uppercase
              "
            >
              Price
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {formatVnd(course.price)}
            </div>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="size-4 shrink-0 text-blue-500" />
              Instructor: {instructorDisplayName(course)}
            </div>
          </div>
          <div className="pt-2">{actions}</div>
        </CardContent>
      </Card>
    </section>
  );
}

export function CourseStructure({
  course,
  baseHref,
}: {
  course: CourseCourseDetail;
  baseHref?: string;
}) {
  if (!course.sections.length) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-slate-600">
          There are no sections/lessons for this course.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {course.sections.map((section, sectionIndex) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span
                className="
                  flex size-7 items-center justify-center rounded-lg border
                  border-blue-100 bg-blue-50 text-xs font-bold text-blue-700
                "
              >
                {sectionIndex + 1}
              </span>
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {section.lessons.length ? (
                section.lessons.map((lesson, lessonIndex) => {
                  const content = (
                    <div
                      className="
                        flex items-center justify-between gap-3 rounded-xl
                        border border-slate-200/70 bg-white px-4 py-3 text-sm
                        transition-colors
                        hover:border-blue-200 hover:bg-blue-50/30
                      "
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="
                            flex size-8 shrink-0 items-center justify-center
                            rounded-lg border border-blue-100 bg-blue-50
                            text-blue-600
                          "
                        >
                          <PlayCircle className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-800">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            Lesson {lessonIndex + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                  if (!baseHref) {
                    return <div key={lesson.id}>{content}</div>;
                  }

                  return (
                    <Link
                      key={lesson.id}
                      href={`${baseHref}/sections/${section.id}/lessons/${lesson.id}`}
                      className="
                        block rounded-xl
                        focus-visible:ring-2 focus-visible:ring-blue-500
                        focus-visible:outline-none
                      "
                    >
                      {content}
                    </Link>
                  );
                })
              ) : (
                <div
                  className="
                    rounded-xl border border-slate-200/60 bg-slate-50 p-4
                    text-sm text-slate-500
                  "
                >
                  This section has no lessons.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LessonSummary({
  title,
  duration,
}: {
  title: string;
  duration?: bigint | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="size-4" />
            {formatDuration(duration)}
          </div>
        </div>
        <Button variant="outline" disabled>
          Lesson API only
        </Button>
      </CardContent>
    </Card>
  );
}
