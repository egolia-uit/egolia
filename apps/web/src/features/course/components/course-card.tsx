'use client';

import {
  BookOpen,
  ChevronRight,
  EyeOff,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '#/components/lib/shadcn/utils';
import { Badge } from '#/components/ui/neumorphism/badge';
import { Button } from '#/components/ui/neumorphism/button';
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

  // Add #t=0.001 to ensure a frame is shown for video thumbnails
  const videoSrc = course.introductionVideoUrl
    ? `${course.introductionVideoUrl}#t=0.001`
    : undefined;

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden bg-nm-bg transition-all duration-300 hover:shadow-nm-inset',
        className
      )}
    >
      <div className="p-3 pb-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-nm-bg shadow-nm-inset">
          {videoSrc ? (
            <video
              className={cn(
                'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
              )}
              muted
              playsInline
              preload="metadata"
              src={videoSrc}
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center text-slate-400'
              )}
            >
              <BookOpen className="size-12 opacity-20" />
            </div>
          )}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            <Badge
              className="shadow-nm-flat-sm"
              variant={course.status === 'approved' ? 'default' : 'secondary'}
            >
              {statusLabel(course.status)}
            </Badge>
            {course.hidden && (
              <Badge className="shadow-nm-flat-sm" variant="outline">
                <EyeOff className="size-3" />
                Hidden
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="line-clamp-2 min-h-12 text-lg font-bold leading-tight text-slate-800">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm/6 text-slate-600">
          {course.overview ||
            'Khóa học chưa có mô tả. Nội dung sẽ được cập nhật sau.'}
        </p>

        {showProgress && (
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-medium text-slate-500">Tiến độ học tập</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <div
              className={cn(
                'h-2.5 w-full overflow-hidden rounded-full bg-nm-bg shadow-nm-inset'
              )}
            >
              <div
                className={cn(
                  'h-full rounded-full bg-primary shadow-nm-flat-sm transition-all duration-1000 ease-out'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div
          className={cn(
            'mt-auto grid grid-cols-2 gap-4 rounded-xl bg-nm-bg p-4 shadow-nm-inset'
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <BookOpen className="size-3.5" />
              Giá khóa học
            </div>
            <div className="font-bold text-primary">
              {formatVnd(course.price)}
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-200/50 pl-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <ShieldCheck className="size-3.5" />
              Giảng viên
            </div>
            <div className="truncate font-semibold text-slate-700">
              {course.instructorId ?? 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-nm-bg px-5 pt-0 pb-5">
        {action ?? (
          <Button asChild variant="outline" className="w-full">
            <Link href={href}>
              <GraduationCap className="mr-2 size-4" />
              Xem chi tiết
              <ChevronRight className="ml-auto size-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
