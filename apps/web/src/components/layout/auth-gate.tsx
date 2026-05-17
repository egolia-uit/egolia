'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { Skeleton } from '#/components/ui/shadcn/skeleton';
import {
  type ActorRole,
  type Viewer,
  primaryRole,
  routeForViewer,
} from '#/lib/auth/roles';
import { useViewer } from '#/lib/auth/use-viewer';

type AuthGateProps = {
  allowedRoles?: ActorRole[];
  children: (viewer: Viewer) => ReactNode;
};

function canUseRoute(viewer: Viewer, allowedRoles?: ActorRole[]) {
  if (!allowedRoles?.length) {
    return true;
  }

  const role = primaryRole(viewer);
  return allowedRoles.includes(role);
}

export function AuthGate({ allowedRoles, children }: AuthGateProps) {
  const router = useRouter();
  const { viewer, loading } = useViewer();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!viewer?.id && !viewer?.accessToken) {
      router.replace('/login');
      return;
    }

    if (viewer && !canUseRoute(viewer, allowedRoles)) {
      router.replace(routeForViewer(viewer));
    }
  }, [allowedRoles, loading, router, viewer]);

  if (loading || !viewer || !canUseRoute(viewer, allowedRoles)) {
    return (
      <div className="min-h-dvh bg-background p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <div className="
            grid gap-4
            md:grid-cols-[220px_1fr]
          ">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  return children(viewer);
}
