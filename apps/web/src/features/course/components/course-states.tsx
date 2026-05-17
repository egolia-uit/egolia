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
    <div className="
      grid gap-4
      md:grid-cols-2
      xl:grid-cols-3
    ">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="bg-nm-bg">
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-9 w-full" />
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
    <Card className="border-dashed bg-nm-bg">
      <CardContent className="
        flex flex-col items-center justify-center gap-3 py-14 text-center
      ">
        <div className="
          flex size-12 items-center justify-center rounded-lg bg-slate-100
          text-slate-500
        ">
          <Inbox className="size-6" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1 max-w-md">
            {description}
          </CardDescription>
        </div>
        {action}
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
    <Card className="border-destructive/30 bg-nm-bg">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="
            flex size-10 shrink-0 items-center justify-center rounded-lg
            bg-destructive/10 text-destructive
          ">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <CardTitle>{error.title}</CardTitle>
            <CardDescription className="mt-1">{error.message}</CardDescription>
            {error.code && (
              <p className="mt-2 text-xs text-slate-500">Code: {error.code}</p>
            )}
          </div>
        </div>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button type="button" variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export function InlineNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-nm-bg p-4 text-sm">
      <div className="font-medium text-slate-950">{title}</div>
      <p className="mt-1 text-slate-600">{description}</p>
    </div>
  );
}
