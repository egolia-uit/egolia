import { SignInButton, SignUpButton } from "#/features/auth";
import { GraduationCap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/neumorphism/card";

export const metadata = {
  title: "Sign In - Egolia",
  description: "Sign in to your Egolia account",
};

export default function LoginPage() {
  return (
    <main className="
      relative flex min-h-screen items-center justify-center overflow-hidden
      bg-nm-bg p-4
    ">
      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="
            flex size-14 items-center justify-center rounded-2xl bg-nm-bg
            shadow-nm-flat
          ">
            <GraduationCap className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Egolia
          </h1>
          <p className="text-sm text-muted-foreground">
            Elearning on the Go
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to continue to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pb-6">
            <SignInButton />
            <SignUpButton />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by Authentik SSO
        </p>
      </div>
    </main>
  );
}
