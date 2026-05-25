'use client';

import { BookOpen, EyeOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '#/components/lib/shadcn/utils';
import { Badge } from '#/components/ui/neumorphism/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import type { CourseCourse } from '#/lib/api/course';
import { formatVnd } from '#/lib/api/format';

export type CourseDestination = 'public' | 'learner' | 'instructor';
type CourseWithInstructor = CourseCourse & {
  instructorName?: string;
  instructorUsername?: string;
  instructor?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
};

function statusLabel(status?: CourseCourse['status']) {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending';
    case 'draft':
    default:
      return 'Draft';
  }
}

function statusVariant(
  status?: CourseCourse['status']
): 'inset' | 'warning' | 'secondary' {
  switch (status) {
    case 'approved':
      return 'inset';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
}

function destinationHref(courseId: string, destination: CourseDestination) {
  switch (destination) {
    case 'learner':
      return `/learn/courses/${courseId}`;
    case 'instructor':
      return `/instructor/courses/${courseId}`;
    case 'public':
    default:
      return `/courses/${courseId}`;
  }
}

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

export function CourseCard({
  course,
  destination = 'public',
  className,
  action,
  progress,
}: {
  course: CourseCourse;
  destination?: CourseDestination;
  className?: string;
  action?: ReactNode;
  progress?: number;
}) {
  const courseId = course.id;
  const href = courseId ? destinationHref(courseId, destination) : '#';
  const showProgress = destination === 'learner' && progress !== undefined;
  const showStatusBadges = destination === 'instructor';

  const videoSrc = course.introductionVideoUrl
    ? `${course.introductionVideoUrl}#t=0.001`
    : undefined;

  const cardBody = (
    <Card
      className={cn(
        `
          group flex flex-col overflow-hidden border border-slate-200/60
          bg-white/95
          shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-slate-300/80
          hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]
        `,
        className
      )}
    >
      {/* Thumbnail */}
      <div className="p-3 pb-0">
        <div
          className="
            relative aspect-video w-full overflow-hidden rounded-xl border
            border-slate-100/60 bg-gradient-to-br from-blue-50 via-indigo-50/40
            to-slate-50/80
          "
        >
          {videoSrc ? (
            <video
              className="
                h-full w-full object-cover transition-transform duration-500
                group-hover:scale-105
              "
              muted
              playsInline
              preload="metadata"
              src={videoSrc}
            />
          ) : (
            <div className="
              flex h-full w-full flex-col items-center justify-center gap-2
            ">
              <div className="
                rounded-full border border-slate-100/50 bg-white/80 p-2.5
                shadow-sm
              ">
                <BookOpen className="size-6 stroke-[1.5] text-indigo-400/80" />
              </div>
            </div>
          )}

          {showStatusBadges && (
            <div
              className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5"
            >
              <Badge variant={statusVariant(course.status)}>
                {statusLabel(course.status)}
              </Badge>
              {course.hidden && (
                <Badge variant="secondary">
                  <EyeOff className="size-3" />
                  Hidden
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle
          className="
            line-clamp-2 min-h-12 text-base leading-snug font-semibold
            text-slate-900 transition-colors duration-200
            group-hover:text-blue-600
          "
        >
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm/6 text-slate-600">
          {course.overview ||
            'Course has no description yet. Content will be updated later.'}
        </p>

        {showProgress && (
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Progress</span>
              <span className="font-semibold text-blue-600">{progress}%</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="
                  h-full rounded-full bg-blue-600 transition-all duration-700
                  ease-out
                "
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata row — flat, no nm shadow */}
        <div
          className="
            mt-auto flex items-center justify-between gap-2 border-t
            border-slate-100 pt-3
          "
        >
          <div className="space-y-0.5">
            <div className="
              flex items-center gap-1 text-xs font-semibold text-slate-500
            ">
              <BookOpen className="size-3.5 text-slate-400" />
              Price
            </div>
            <div className="text-sm font-bold text-slate-900">
              {formatVnd(course.price)}
            </div>
          </div>
          <div className="min-w-0 space-y-0.5 text-right">
            <div
              className="
                flex items-center justify-end gap-1 text-xs font-semibold
                text-slate-500
              "
            >
              <ShieldCheck className="size-3.5 text-slate-400" />
              Instructor
            </div>
            <div className="truncate text-sm font-semibold text-slate-800">
              {instructorDisplayName(course)}
            </div>
          </div>
        </div>

        {/* Subtle View details CTA for clickable affordance */}
        {!action && (
          <div
            className="
              mt-2 flex items-center justify-end gap-1 border-t border-slate-50
              pt-2.5 text-xs font-semibold text-blue-600 transition-colors
              duration-200
              group-hover:text-blue-700
            "
          >
            <span>View details</span>
            <svg
              className="
                size-3.5 transition-transform duration-300
                group-hover:translate-x-0.5
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </CardContent>

      {action && <CardFooter className="px-5 pt-0 pb-5">{action}</CardFooter>}
    </Card>
  );

  if (action) {
    return cardBody;
  }

  return (
    <Link
      href={href}
      className="
        block rounded-2xl
        focus-visible:ring-2 focus-visible:ring-blue-500
        focus-visible:ring-offset-2 focus-visible:outline-none
      "
    >
      {cardBody}
    </Link>
  );
}
