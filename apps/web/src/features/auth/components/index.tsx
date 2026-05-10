"use client";

import { authClient } from "#/lib/auth";
import { LogOut } from "lucide-react";

import { Button } from "#/components/ui/shadcn/button";

export function SignInButton() {
  const handleSignIn = async () => {
    await authClient.signIn.oauth2({
      providerId: "authentik",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login?error=auth_failed",
    });
  };

  return (
    <Button
      id="sign-in-button"
      size="lg"
      onClick={handleSignIn}
      className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer"
    >
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      Sign in with Authentik
    </Button>
  );
}

export function SignOutButton() {
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <Button
      id="sign-out-button"
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
