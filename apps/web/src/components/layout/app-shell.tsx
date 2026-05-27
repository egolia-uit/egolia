'use client';

import {
  Award,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CreditCard,
  GraduationCap,
  Home,
  LibraryBig,
  type LucideIcon,
  Menu,
  Newspaper,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';

import { cn } from '#/components/lib/shadcn/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '#/components/ui/shadcn/avatar';
import { Button } from '#/components/ui/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/shadcn/sheet';
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

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function navForViewer(viewer?: Viewer | null): NavGroup[] {
  const isLoggedIn = Boolean(viewer?.id && viewer?.accessToken);
  const isInstructor =
    hasRole(viewer, 'instructor') || hasRole(viewer, 'admin');
  const isAdmin = hasRole(viewer, 'admin');

  const groups: NavGroup[] = [];

  // Main navigation — always visible
  const mainItems: NavItem[] = [
    { href: '/courses', icon: LibraryBig, label: 'Explore' },
    { href: '/blog', icon: Newspaper, label: 'Blog' },
  ];
  groups.push({ label: 'Explore', items: mainItems });

  if (isLoggedIn) {
    groups.push({
      label: 'Learning',
      items: [
        { href: '/learn', icon: Home, label: 'Overview' },
        { href: '/learn?tab=enrolled', icon: BookOpen, label: 'Enrolled' },
        { href: '/learn?tab=bookmarked', icon: Bookmark, label: 'Saved' },
        { href: '/learn?tab=certificates', icon: Award, label: 'Certificates' },
        { href: '/billing', icon: CreditCard, label: 'Billing' },
      ],
    });
  }

  // Instructor
  if (isInstructor) {
    groups.push({
      label: 'Teaching',
      items: [
        {
          href: '/instructor/courses',
          icon: GraduationCap,
          label: 'My Courses',
        },
      ],
    });
  }

  // Admin
  if (isAdmin) {
    groups.push({
      label: 'Administration',
      items: [
        { href: '/admin/courses', icon: ShieldCheck, label: 'Manage Courses' },
        {
          href: '/admin/courses?tab=pending',
          icon: BookOpenCheck,
          label: 'Pending Review',
        },
        { href: '/admin/billing', icon: CreditCard, label: 'Revenue' },
        { href: '/admin/blog', icon: Newspaper, label: 'Manage Blog' },
      ],
    });
  }

  return groups;
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
  if (!viewer?.id || !viewer?.accessToken) {
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

function NavListInner({
  groups,
  currentSearch,
  pathname,
}: {
  groups: NavGroup[];
  currentSearch: string;
  pathname: string;
}) {
  const currentTab = new URLSearchParams(currentSearch).get('tab') ?? '';

  return (
    <nav className="grid gap-5">
      {groups.map((group) => (
        <div key={group.label} className="grid gap-2">
          <div className="px-2 text-xs font-semibold text-slate-400 uppercase">
            {group.label}
          </div>
          <div className="grid gap-1">
            {group.items.map((item) => {
              const [itemPath, itemSearch = ''] = item.href.split('?');
              const itemTab = new URLSearchParams(itemSearch).get('tab') ?? '';
              const active =
                pathname === itemPath
                  ? itemTab === currentTab
                  : pathname.startsWith(`${itemPath}/`) && !itemTab;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    `
                      flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm
                      font-medium text-slate-600 transition-colors
                      hover:bg-slate-100 hover:text-slate-900
                    `,
                    active && 'border border-blue-100 bg-blue-50 text-blue-700'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function NavListActive({
  groups,
  pathname,
}: {
  groups: NavGroup[];
  pathname: string;
}) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString()
    ? `?${searchParams.toString()}`
    : '';
  return (
    <NavListInner
      groups={groups}
      currentSearch={currentSearch}
      pathname={pathname}
    />
  );
}

function NavList({
  groups,
  pathname,
}: {
  groups: NavGroup[];
  pathname: string;
}) {
  return (
    <Suspense
      fallback={
        <NavListInner groups={groups} currentSearch="" pathname={pathname} />
      }
    >
      <NavListActive groups={groups} pathname={pathname} />
    </Suspense>
  );
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
  const groups = navForViewer(viewer);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <header
        className="
          sticky top-0 z-40 border-b border-slate-200/70 bg-white/90
          backdrop-blur-sm
        "
      >
        <div
          className="
            mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4
            sm:px-6
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="size-4" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 border-none bg-white p-0 shadow-xl"
              >
                <div className="flex h-full flex-col bg-white">
                  <SheetHeader
                    className="
                      border-b border-slate-100 bg-white px-6 py-5 text-left
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex size-9 shrink-0 items-center justify-center
                          rounded-lg bg-slate-950 text-white
                        "
                      >
                        <GraduationCap className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <SheetTitle
                          className="
                            text-sm font-semibold tracking-tight text-slate-950
                          "
                        >
                          Egolia
                        </SheetTitle>
                        <div className="text-[11px] font-medium text-slate-500">
                          Elearning on the Go
                        </div>
                      </div>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto bg-white px-6 py-5">
                    <NavList groups={groups} pathname={pathname} />
                  </div>
                  <div className="border-t border-slate-100 bg-white p-6">
                    {viewer?.id && viewer?.accessToken ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar className="size-9">
                            <AvatarImage
                              alt={viewer.name ?? viewer.email ?? 'User'}
                              src={viewer.image ?? undefined}
                            />
                            <AvatarFallback className="
                              bg-slate-900 text-xs text-white
                            ">
                              {initials(viewer.name, viewer.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div
                              className="
                                truncate text-xs font-semibold text-slate-950
                              "
                            >
                              {viewer.name ?? viewer.email ?? 'User'}
                            </div>
                            <div className="
                              text-[10px] font-medium text-slate-500
                            ">
                              {roleLabel(viewer)}
                            </div>
                          </div>
                        </div>
                        <SignOutButton />
                      </div>
                    ) : (
                      <div className="w-full">
                        <SignInButton />
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

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
          </div>

          <div className="flex min-w-0 items-center gap-3">
            {viewer?.id && viewer?.accessToken ? (
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
      </header>

      <div
        className="
          mx-auto grid max-w-7xl gap-6 px-4 py-6
          sm:px-6
          lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8
        "
      >
        <aside
          className="
            hidden
            lg:block
          "
        >
          <div className="sticky top-24 grid gap-4">
            <div
              className="
                rounded-2xl border border-slate-200/80 bg-white/95 p-4
                shadow-[0_8px_30px_rgba(15,23,42,0.04),0_1px_2px_rgba(0,0,0,0.02)]
              "
            >
              <NavList groups={groups} pathname={pathname} />
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">
          <section
            className="
              flex flex-col gap-4
              lg:flex-row lg:items-end lg:justify-between
            "
          >
            <div className="min-w-0">
              {eyebrow && (
                <div
                  className="
                    mb-2 text-xs font-semibold tracking-wide text-blue-600
                    uppercase
                  "
                >
                  {eyebrow}
                </div>
              )}
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
    </div>
  );
}
