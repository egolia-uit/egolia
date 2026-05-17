'use client';

import { LogOut } from 'lucide-react';

import { Button } from '#/components/ui/neumorphism/button';
import {
  openCenteredPopup,
  waitForAuthPopup,
} from '#/features/auth/popup';
import { authClient } from '#/lib/auth';
import { clearAuthentikAccessTokenCache } from '#/lib/auth/access-token';

function getLogoutRedirectUrl() {
  const endSessionUrl = process.env.NEXT_PUBLIC_AUTHENTIK_END_SESSION_URL;

  if (!endSessionUrl) {
    return '/login';
  }

  const url = new URL(endSessionUrl);
  url.searchParams.set(
    'post_logout_redirect_uri',
    process.env.NEXT_PUBLIC_AUTHENTIK_POST_LOGOUT_REDIRECT_URI ||
      `${window.location.origin}/auth/popup-logout`
  );
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
      Đăng nhập với Authentik
    </Button>
  );
}

export function SignOutButton() {
  const handleSignOut = async () => {
    const logoutUrl = getLogoutRedirectUrl();
    const popup =
      logoutUrl === '/login'
        ? null
        : openCenteredPopup('about:blank', 'egolia-auth-logout');

    clearAuthentikAccessTokenCache();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => clearAuthentikAccessTokenCache(),
      },
    });

    if (logoutUrl === '/login') {
      window.location.href = '/courses';
      return;
    }

    if (!popup) {
      window.location.href = '/courses';
      return;
    }

    try {
      popup.location.href = logoutUrl;
      await waitForAuthPopup(popup, 60_000);
    } catch {
      // popup closed or timed out — that's fine
    }

    // Always reload the main page after logout
    window.location.href = '/courses';
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
      Đăng xuất
    </Button>
  );
}
