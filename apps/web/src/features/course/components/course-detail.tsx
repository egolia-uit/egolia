'use client';

import { BookOpen, Clock, EyeOff, ListChecks, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '#/components/ui/neumorphism/badge';
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

function courseStatus(status?: CourseCourse['status']) {
  if (status === 'approved') {
    return 'Approved';
  }
  if (status === 'pending') {
    return 'Pending';
  }
  return 'Draft';
}

export function CourseHero({
  course,
  actions,
}: {
  course: CourseCourse;
  actions?: ReactNode;
}) {
  return (
    <section className="
      grid gap-4
      lg:grid-cols-[1fr_340px]
    ">
      <Card className="bg-nm-bg">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge>{courseStatus(course.status)}</Badge>
            {course.hidden && (
              <Badge variant="outline">
                <EyeOff className="size-3" />
                Hidden
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{course.title}</CardTitle>
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
            {course.overview || 'Khóa học chưa có overview.'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-nm-bg">
        <CardHeader>
          <CardTitle>Course snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs tracking-wide text-slate-500 uppercase">
              Price
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {formatVnd(course.price)}
            </div>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <BookOpen className="size-4" />
              Instructor: {course.instructorId ?? 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ListChecks className="size-4" />
              Status: {courseStatus(course.status)}
            </div>
          </div>
          <div className="pt-2">
            {actions}
          </div>
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
      <Card className="bg-nm-bg">
        <CardContent className="py-8 text-sm text-slate-600">
          Chưa có section/lesson nào cho khóa học này.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {course.sections.map((section, sectionIndex) => (
        <Card key={section.id} className="bg-nm-bg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="
                flex size-7 items-center justify-center rounded-xl bg-nm-bg
                text-xs shadow-nm-inset font-bold text-primary
              ">
                {sectionIndex + 1}
              </span>
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {section.lessons.length ? (
                section.lessons.map((lesson, lessonIndex) => {
                  const content = (
                    <div className="
                      flex items-center justify-between gap-3 rounded-2xl
                      bg-nm-bg px-4 py-3 text-sm shadow-nm-inset
                      transition-all
                    ">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="
                          flex size-9 shrink-0 items-center justify-center
                          rounded-xl bg-nm-bg text-primary shadow-nm-flat-sm
                        ">
                          <PlayCircle className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-800">
                            {lesson.title}
                          </div>
                          <div className="text-xs font-medium text-slate-500">
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
                    >
                      {content}
                    </Link>
                  );
                })
              ) : (
                <div className="
                  rounded-xl bg-nm-bg p-4 text-sm
                  text-slate-500 shadow-nm-inset
                ">
                  Section này chưa có lesson.
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
    <Card className="bg-nm-bg">
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div>
          <div className="font-medium">{title}</div>
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
