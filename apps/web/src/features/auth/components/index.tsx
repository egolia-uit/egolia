'use client';

import { LogOut, UserPlus } from 'lucide-react';

import { Button } from '#/components/ui/neumorphism/button';
import { openCenteredPopup, waitForAuthPopup } from '#/features/auth/popup';
import { authClient } from '#/lib/auth';
import { clearAuthentikAccessTokenCache } from '#/lib/auth/access-token';
import { getPublicRuntimeEnv } from '#/lib/env';

const AUTHENTIK_LOGOUT_POPUP_TIMEOUT_MS = 4_000;

function getAuthentikEnrollmentUrl(nextUrl: string) {
  const env = getPublicRuntimeEnv();
  const url = new URL(env.NEXT_PUBLIC_AUTHENTIK_ENROLLMENT_URL);

  url.searchParams.set('next', nextUrl);
  return url.toString();
}

function getAuthentikLogoutUrl(redirectUri: string) {
  const env = getPublicRuntimeEnv();
  const url = new URL(env.NEXT_PUBLIC_AUTHENTIK_LOGOUT_URL);

  url.searchParams.set('next', redirectUri);
  return url.toString();
}

function getWebUrl(path: string) {
  const env = getPublicRuntimeEnv();
  return new URL(path, env.NEXT_PUBLIC_BETTER_AUTH_URL).toString();
}

function logoutAuthentikInPopup() {
  return new Promise<void>((resolve) => {
    const popup = openCenteredPopup(
      getAuthentikLogoutUrl('/'),
      'egolia-auth-logout'
    );

    if (!popup) {
      window.location.href = getAuthentikLogoutUrl(getWebUrl('/login'));
      return;
    }

    let done = false;

    const cleanup = () => {
      if (done) {
        return;
      }
      done = true;
      popup.close();
      resolve();
    };

    const poll = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(poll);
        cleanup();
      }
    }, 250);

    window.setTimeout(() => {
      window.clearInterval(poll);
      cleanup();
    }, AUTHENTIK_LOGOUT_POPUP_TIMEOUT_MS);
  });
}

export function SignInButton() {
  const handleSignIn = async () => {
    const popup = openCenteredPopup('about:blank', 'egolia-auth-login');

    try {
      const result = await authClient.signIn.oauth2({
        providerId: 'authentik',
        callbackURL: '/auth/popup-callback',
        disableRedirect: true,
        errorCallbackURL: '/login?error=auth_failed',
      });
      const url = result.data?.url;

      if (!url) {
        popup?.close();
        await authClient.signIn.oauth2({
          providerId: 'authentik',
          callbackURL: '/dashboard',
          errorCallbackURL: '/login?error=auth_failed',
        });
        return;
      }

      if (!popup) {
        window.location.href = url;
        return;
      }

      popup.location.href = url;
      const message = await waitForAuthPopup(popup);
      window.location.href = message.redirectTo || '/dashboard';
    } catch {
      popup?.close();
      window.location.href = '/login?error=auth_failed';
    }
  };

  return (
    <Button
      id="sign-in-button"
      size="lg"
      onClick={handleSignIn}
      className="w-full cursor-pointer gap-2"
    >
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      Sign in with Authentik
    </Button>
  );
}

export function SignUpButton() {
  const handleSignUp = async () => {
    const popup = openCenteredPopup('about:blank', 'egolia-auth-sign-up');

    try {
      const result = await authClient.signIn.oauth2({
        providerId: 'authentik',
        callbackURL: '/auth/popup-callback',
        disableRedirect: true,
        errorCallbackURL: '/login?error=auth_failed',
      });
      const url = result.data?.url;

      if (!url) {
        popup?.close();
        window.location.href = getAuthentikEnrollmentUrl(
          `${window.location.origin}/login`
        );
        return;
      }

      const enrollmentUrl = getAuthentikEnrollmentUrl(url);

      if (!popup) {
        window.location.href = enrollmentUrl;
        return;
      }

      popup.location.href = enrollmentUrl;
      const message = await waitForAuthPopup(popup);
      window.location.href = message.redirectTo || '/dashboard';
    } catch {
      popup?.close();
      window.location.href = '/login?error=auth_failed';
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={handleSignUp}
      className="w-full cursor-pointer gap-2"
    >
      <UserPlus className="size-5" />
      Create Account
    </Button>
  );
}

export function SignOutButton() {
  const handleSignOut = async () => {
    const loginUrl = getWebUrl('/login');

    clearAuthentikAccessTokenCache();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => clearAuthentikAccessTokenCache(),
      },
    });

    await logoutAuthentikInPopup();
    window.location.href = loginUrl;
  };

  return (
    <Button
      id="sign-out-button"
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="
        cursor-pointer gap-2 text-muted-foreground
        hover:text-foreground
      "
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
