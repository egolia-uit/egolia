'use client';

import { genericOAuthClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

type AuthClientSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} | null;

type WebAuthClient = {
  getSession: () => Promise<{ data: AuthClientSession }>;
  getAccessToken: (options: {
    providerId: string;
  }) => Promise<{ data: { accessToken?: string } | null }>;
  signIn: {
    oauth2: (options: {
      providerId: string;
      callbackURL?: string;
      errorCallbackURL?: string;
      disableRedirect?: boolean;
    }) => Promise<{
      data?: {
        url?: string;
        redirect?: boolean;
      } | null;
    }>;
  };
  signOut: (options?: {
    fetchOptions?: {
      onSuccess?: () => void;
    };
  }) => Promise<unknown>;
};

const authClientOptions = {
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [genericOAuthClient()],
};

export const authClient = createAuthClient(authClientOptions) as WebAuthClient;
