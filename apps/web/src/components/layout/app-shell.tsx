'use client';

import {
  BookOpen,
  GraduationCap,
  LibraryBig,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { cn } from '#/components/lib/shadcn/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/ui/shadcn/avatar';
import { Badge } from '#/components/ui/shadcn/badge';
import { SignInButton, SignOutButton } from '#/features/auth';
import { type Viewer, hasRole } from '#/lib/auth/roles';

type AppShellProps = {
  viewer?: Viewer | null;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const publicNav = [
  { href: '/courses', label: 'Marketplace', icon: LibraryBig },
];

function navForViewer(viewer?: Viewer | null) {
  const links = [...publicNav];

  if (viewer?.id || viewer?.accessToken) {
    links.push({ href: '/learn', label: 'My learning', icon: BookOpen });
  }
  if (hasRole(viewer, 'instructor') || hasRole(viewer, 'admin')) {
    links.push({
      href: '/instructor/courses',
      label: 'Teaching',
      icon: GraduationCap,
    });
  }
  if (hasRole(viewer, 'admin')) {
    links.push({ href: '/admin/courses', label: 'Admin', icon: ShieldCheck });
  }

  return links;
}

function initials(name?: string | null, email?: string | null) {
  const source = name || email || 'Guest';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function roleLabel(viewer?: Viewer | null) {
  if (!viewer?.id && !viewer?.accessToken) {
    return 'Guest';
  }
  if (hasRole(viewer, 'admin')) {
    return 'Admin';
  }
  if (hasRole(viewer, 'instructor')) {
    return 'Instructor';
  }
  return 'Learner';
}

export function AppShell({
  viewer,
  eyebrow,
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const links = navForViewer(viewer);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <header
        className="
        sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm
      "
      >
        <div
          className="
          mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4
          sm:px-6
        "
        >
          <Link href="/courses" className="flex min-w-0 items-center gap-3">
            <div
              className="
              flex size-9 shrink-0 items-center justify-center rounded-lg
              bg-slate-950 text-white
            "
            >
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Egolia</div>
              <div className="truncate text-xs text-slate-500">
                Elearning on the Go
              </div>
            </div>
          </Link>

          <nav
            className="
            hidden items-center gap-1
            md:flex
          "
          >
            {links.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    `
                      inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm
                      font-medium text-slate-600 transition-colors
                      hover:bg-slate-100 hover:text-slate-950
                    `,
                    active &&
                      `
                        bg-slate-950 text-white
                        hover:bg-slate-900 hover:text-white
                      `
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center gap-3">
            {viewer?.id || viewer?.accessToken ? (
              <>
                <div
                  className="
                  hidden min-w-0 items-center gap-2
                  sm:flex
                "
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      alt={viewer.name ?? viewer.email ?? 'User'}
                      src={viewer.image ?? undefined}
                    />
                    <AvatarFallback className="bg-slate-900 text-xs text-white">
                      {initials(viewer.name, viewer.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {viewer.name ?? viewer.email ?? 'User'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {roleLabel(viewer)}
                    </div>
                  </div>
                </div>
                <SignOutButton />
              </>
            ) : (
              <div className="w-44">
                <SignInButton />
              </div>
            )}
          </div>
        </div>
        <div
          className="
          border-t border-slate-100 px-3 py-2
          md:hidden
        "
        >
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
            {links.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    `
                      inline-flex h-9 shrink-0 items-center gap-2 rounded-lg
                      px-3 text-sm font-medium text-slate-600
                    `,
                    active && 'bg-slate-950 text-white'
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        className="
        mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6
        sm:px-6
        lg:py-8
      "
      >
        <section
          className="
          flex flex-col gap-4
          lg:flex-row lg:items-end lg:justify-between
        "
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {eyebrow && (
                <Badge variant="outline" className="bg-white">
                  {eyebrow}
                </Badge>
              )}
              {viewer?.id || viewer?.accessToken ? (
                <Badge variant="secondary" className="bg-slate-100">
                  <UserRound className="size-3" />
                  {roleLabel(viewer)}
                </Badge>
              ) : null}
            </div>
            <h1
              className="
              text-2xl font-semibold tracking-tight text-slate-950
              sm:text-3xl
            "
            >
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-3xl text-sm/6 text-slate-600">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
          )}
        </section>

        {children}
      </main>
    </div>
  );
}
