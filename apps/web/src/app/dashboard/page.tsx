import { redirect } from "next/navigation";

import { getSession } from "#/features/auth/queries";
import { SignOutButton } from "#/features/auth";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/shadcn/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#/components/ui/shadcn/avatar";

export const metadata = {
  title: "Dashboard - Egolia",
  description: "Your Egolia learning dashboard",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const stats = [
    {
      label: "Courses Enrolled",
      value: "0",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "In Progress",
      value: "0",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Completed",
      value: "0",
      icon: GraduationCap,
      color: "from-emerald-500 to-green-500",
    },
    {
      label: "Classmates",
      value: "0",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <GraduationCap className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Egolia</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-8 ring-2 ring-white/10">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="bg-indigo-600 text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="size-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <p className="text-slate-400">
            Welcome back, {user.name}! Here&apos;s your learning overview.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="group border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-400 text-xs">
                    {stat.label}
                  </CardDescription>
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}
                  >
                    <stat.icon className="size-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-white">
                  {stat.value}
                </CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-white/5 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Your latest learning activities will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-800/80 mb-4">
                <BookOpen className="size-7 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                No activity yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Start exploring courses to see your progress here
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
