'use client';

import { genericOAuthClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { getPublicRuntimeEnv } from '../env';

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
  baseURL: getPublicRuntimeEnv().NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [genericOAuthClient()],
};

export const authClient = createAuthClient(authClientOptions) as WebAuthClient;
