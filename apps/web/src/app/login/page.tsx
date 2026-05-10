import { SignInButton } from "#/features/auth";
import { GraduationCap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/shadcn/card";

export const metadata = {
  title: "Sign In - Egolia",
  description: "Sign in to your Egolia account",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Egolia
          </h1>
          <p className="text-sm text-slate-400">
            Elearning on the Go
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to continue to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <SignInButton />
            <p className="mt-4 text-center text-xs text-slate-500">
              By signing in, you agree to our Terms of Service
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-600">
          Powered by Authentik SSO
        </p>
      </div>
    </main>
  );
}
