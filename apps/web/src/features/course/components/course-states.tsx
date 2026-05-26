import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '#/components/ui/neumorphism/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/neumorphism/card';
import { Skeleton } from '#/components/ui/shadcn/skeleton';
import type { ApiProblem } from '#/lib/api/errors';

export function CourseGridSkeleton() {
  return (
    <div
      className="
        grid gap-4
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent
        className="
          flex flex-col items-center justify-center gap-4 py-16 text-center
        "
      >
        <div
          className="
            flex size-14 items-center justify-center rounded-2xl bg-slate-100
            text-slate-400
          "
        >
          <Inbox className="size-7" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900">
            {title}
          </CardTitle>
          <CardDescription className="mx-auto max-w-sm text-sm leading-relaxed">
            {description}
          </CardDescription>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: ApiProblem;
  onRetry?: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl border border-red-200/60 bg-white
        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-10 shrink-0 items-center justify-center rounded-xl
              bg-red-50 text-red-600
            "
          >
            <AlertCircle className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{error.title}</div>
            <p className="mt-1 text-sm text-slate-600">{error.message}</p>
            {error.code && (
              <p className="mt-2 text-xs text-slate-500">Code: {error.code}</p>
            )}
          </div>
        </div>
        {onRetry && (
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={onRetry}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InlineNotice({
  title,
  description,
  variant = 'info',
}: {
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div
      className={`
        rounded-xl border p-4 text-sm
        ${styles[variant]}
      `}
    >
      <div className="font-semibold">{title}</div>
      <p className="mt-1 opacity-90">{description}</p>
    </div>
  );
}
