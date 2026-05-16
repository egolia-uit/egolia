'use client';

import {
  BookOpen,
  BookOpenCheck,
  CreditCard,
  GraduationCap,
  LibraryBig,
  Menu,
  Newspaper,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

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
  const isLoggedIn = Boolean(viewer?.id || viewer?.accessToken);
  const isInstructor = hasRole(viewer, 'instructor') || hasRole(viewer, 'admin');
  const isAdmin = hasRole(viewer, 'admin');

  const groups: NavGroup[] = [];

  // Main navigation — always visible
  const mainItems: NavItem[] = [
    { href: '/courses', icon: LibraryBig, label: 'Khám phá' },
    { href: '/blog', icon: Newspaper, label: 'Blog' },
  ];
  groups.push({ label: 'Khám phá', items: mainItems });

  // Learner — logged in users
  if (isLoggedIn) {
    groups.push({
      label: 'Học tập',
      items: [
        { href: '/learn', icon: BookOpen, label: 'Đang học' },
        { href: '/learn?tab=bookmarked', icon: BookOpenCheck, label: 'Đã lưu' },
        { href: '/billing', icon: CreditCard, label: 'Thanh toán' },
      ],
    });
  }

  // Instructor
  if (isInstructor) {
    groups.push({
      label: 'Giảng dạy',
      items: [
        { href: '/instructor/courses', icon: GraduationCap, label: 'Khóa học của tôi' },
      ],
    });
  }

  // Admin
  if (isAdmin) {
    groups.push({
      label: 'Quản trị',
      items: [
        { href: '/admin/courses', icon: ShieldCheck, label: 'Quản lý khóa học' },
        { href: '/admin/courses?tab=pending', icon: BookOpenCheck, label: 'Chờ duyệt' },
        { href: '/admin/billing', icon: CreditCard, label: 'Doanh thu' },
        { href: '/admin/blog', icon: Newspaper, label: 'Quản lý blog' },
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

function NavList({
  groups,
  currentSearch,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  currentSearch: string;
  pathname: string;
  onNavigate?: () => void;
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
                  onClick={onNavigate}
                  className={cn(
                    `
                      flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm
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

export function AppShell({
  viewer,
  eyebrow,
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState('');
  const groups = navForViewer(viewer);

  useEffect(() => {
    const syncSearch = () => setCurrentSearch(window.location.search);

    syncSearch();
    window.addEventListener('popstate', syncSearch);
    return () => window.removeEventListener('popstate', syncSearch);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      <header className="
        sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm
      ">
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
              <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                <SheetHeader className="border-b px-4 py-4 text-left">
                  <SheetTitle>Egolia</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <NavList
                    currentSearch={currentSearch}
                    groups={groups}
                    pathname={pathname}
                    onNavigate={() => {
                      window.setTimeout(
                        () => setCurrentSearch(window.location.search),
                        0
                      );
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/courses" className="flex min-w-0 items-center gap-3">
              <div className="
                flex size-9 shrink-0 items-center justify-center rounded-lg
                bg-slate-950 text-white
              ">
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
            {viewer?.id || viewer?.accessToken ? (
              <>
                <div className="
                  hidden min-w-0 items-center gap-2
                  sm:flex
                ">
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
        <aside className="
          hidden
          lg:block
        ">
          <div className="sticky top-24 grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-3 flex items-center gap-2 px-2">
                <UserRound className="size-4 text-slate-500" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {roleLabel(viewer)}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {viewer?.email ?? 'Chưa đăng nhập'}
                  </div>
                </div>
              </div>
              <NavList
                currentSearch={currentSearch}
                groups={groups}
                pathname={pathname}
                onNavigate={() => {
                  window.setTimeout(
                    () => setCurrentSearch(window.location.search),
                    0
                  );
                }}
              />
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
                <div className="mb-2 text-sm font-medium text-indigo-600">
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
