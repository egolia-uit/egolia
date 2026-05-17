'use client';

import { authClient } from '#/lib/auth';

const TOKEN_CACHE_TTL_MS = 10_000;

let cachedAccessToken: string | undefined;
let cachedAccessTokenExpiresAt = 0;
let pendingAccessToken: Promise<string | undefined> | undefined;

export async function getCachedAuthentikAccessToken(options?: {
  force?: boolean;
}) {
  const now = Date.now();

  if (
    !options?.force &&
    cachedAccessToken &&
    cachedAccessTokenExpiresAt > now
  ) {
    return cachedAccessToken;
  }

  if (!options?.force && pendingAccessToken) {
    return pendingAccessToken;
  }

  pendingAccessToken = authClient
    .getAccessToken({ providerId: 'authentik' })
    .then(({ data }) => {
      cachedAccessToken = data?.accessToken;
      cachedAccessTokenExpiresAt = cachedAccessToken
        ? Date.now() + TOKEN_CACHE_TTL_MS
        : 0;
      return cachedAccessToken;
    })
    .catch(() => {
      clearAuthentikAccessTokenCache();
      return undefined;
    })
    .finally(() => {
      pendingAccessToken = undefined;
    });

  return pendingAccessToken;
}

export function clearAuthentikAccessTokenCache() {
  cachedAccessToken = undefined;
  cachedAccessTokenExpiresAt = 0;
  pendingAccessToken = undefined;
}
