'use client';

import { LogOut, UserPlus } from 'lucide-react';

import { Button } from '#/components/ui/neumorphism/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/shadcn/dropdown-menu';
import {
  openCenteredPopup,
  postAuthPopupMessage,
  waitForAuthPopup,
} from '#/features/auth/popup';
import { authClient } from '#/lib/auth';
import { clearAuthentikAccessTokenCache } from '#/lib/auth/access-token';

const defaultAuthentikEnrollmentUrl =
  'http://authentik.egolia.localhost/if/flow/egolia-enrollment/';
const defaultAuthentikLogoutUrl =
  'http://authentik.egolia.localhost/if/flow/default-invalidation-flow/';

function getPopupLogoutRedirectUri() {
  return (
    process.env.NEXT_PUBLIC_AUTHENTIK_POST_LOGOUT_REDIRECT_URI ||
    `${window.location.origin}/auth/popup-logout`
  );
}

function getAuthentikEnrollmentUrl(nextUrl: string) {
  const url = new URL(
    process.env.NEXT_PUBLIC_AUTHENTIK_ENROLLMENT_URL ||
      defaultAuthentikEnrollmentUrl
  );
  url.searchParams.set('next', nextUrl);
  return url.toString();
}

function getAuthentikLogoutUrl(redirectUri: string) {
  const url = new URL(
    process.env.NEXT_PUBLIC_AUTHENTIK_LOGOUT_URL || defaultAuthentikLogoutUrl
  );
  url.searchParams.set('next', redirectUri);
  return url.toString();
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
  const handleSignOut = async (logoutAuthentik: boolean) => {
    const popup = logoutAuthentik
      ? openCenteredPopup('about:blank', 'egolia-auth-logout')
      : null;

    clearAuthentikAccessTokenCache();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => clearAuthentikAccessTokenCache(),
      },
    });

    if (!logoutAuthentik) {
      if (window.opener) {
        postAuthPopupMessage('signed-out', '/courses');
        window.close();
      } else {
        window.location.href = '/courses';
      }
      return;
    }

    if (!popup) {
      window.location.href = getAuthentikLogoutUrl(
        `${window.location.origin}/courses`
      );
      return;
    }

    try {
      popup.location.href = getAuthentikLogoutUrl(getPopupLogoutRedirectUri());
      await waitForAuthPopup(popup, 60_000);
      window.location.href = '/courses';
    } catch {
      popup.close();
      window.location.href = '/courses';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="sign-out-button"
          variant="ghost"
          size="sm"
          className="
            cursor-pointer gap-2 text-muted-foreground
            hover:text-foreground
          "
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={() => handleSignOut(false)}>
          Sign out from Egolia only
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSignOut(true)}>
          Sign out from Authentik completely
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
