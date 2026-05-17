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

  return (
    <Card
      className={cn(
        `
          group flex h-full flex-col rounded-[22px]
          border border-white/45 bg-nm-bg/95 shadow-nm-flat-sm
          transition-[transform,box-shadow] duration-200
          hover:-translate-y-0.5 hover:shadow-nm-flat
        `,
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge
            variant={course.status === 'approved' ? 'default' : 'secondary'}
          >
            {statusLabel(course.status)}
          </Badge>
          {course.hidden && (
            <Badge variant="outline">
              <EyeOff className="size-3" />
              Hidden
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 min-h-10">{course.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <p className="line-clamp-3 min-h-16 text-sm/6 text-slate-600">
          {course.overview ||
            'Khóa học chưa có mô tả. Nội dung sẽ được cập nhật sau.'}
        </p>

        {showProgress && (
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Tiến độ</span>
              <span className="font-semibold text-indigo-600">{progress}%</span>
            </div>
            <div
              className="
              h-2 overflow-hidden rounded-full bg-nm-bg shadow-nm-inset
            "
            >
              <div
                className="
                  h-full rounded-full bg-primary shadow-nm-flat-sm
                  transition-all duration-500
                "
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div
          className="
            grid grid-cols-2 gap-3 rounded-xl border border-white/55
            bg-nm-bg/75 p-3 text-sm shadow-nm-inset
          "
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="size-3.5" />
              Giá
            </div>
            <div className="mt-1 font-semibold text-slate-950">
              {formatVnd(course.price)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="size-3.5" />
              Giảng viên
            </div>
            <div className="mt-1 truncate font-medium text-slate-950">
              {course.instructorId ?? 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className="
          mt-auto items-start gap-2 rounded-b-[22px] border-t border-white/45
          bg-nm-bg/85 pt-4
        "
      >
        {action ?? (
          <Button asChild variant="outline">
            <Link href={href}>
              <GraduationCap className="size-4" />
              Xem chi tiết
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
