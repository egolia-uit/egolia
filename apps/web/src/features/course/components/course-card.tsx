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
import { Badge } from '#/components/ui/shadcn/badge';
import { Button } from '#/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/shadcn/card';
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
}: {
  course: CourseCourse;
  destination?: CourseDestination;
  className?: string;
  action?: ReactNode;
}) {
  const courseId = course.id;
  const href = courseId ? destinationHref(courseId, destination) : '#';

  return (
    <Card
      className={cn(`
        bg-white transition-shadow
        hover:shadow-sm
      `, className)}
    >
      <CardHeader>
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

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-3 min-h-16 text-sm/6 text-slate-600">
          {course.overview ||
            'Khóa học chưa có mô tả. Nội dung sẽ được cập nhật sau.'}
        </p>
        <div className="
          grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm
        ">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="size-3.5" />
              Price
            </div>
            <div className="mt-1 font-semibold text-slate-950">
              {formatVnd(course.price)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="size-3.5" />
              Instructor
            </div>
            <div className="mt-1 truncate font-medium text-slate-950">
              {course.instructorId ?? 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2 bg-slate-50">
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
