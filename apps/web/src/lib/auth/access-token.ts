'use client';

import { authClient } from '#/lib/auth';

const TOKEN_CACHE_TTL_MS = 10_000;
const TOKEN_RETRY_DELAY_MS = 150;

let cachedAccessToken: string | undefined;
let cachedAccessTokenExpiresAt = 0;
let pendingAccessToken: Promise<string | undefined> | undefined;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestAuthentikAccessToken(retries: number) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { data } = await authClient.getAccessToken({
      providerId: 'authentik',
    });

    if (data?.accessToken) {
      return data.accessToken;
    }

    if (attempt < retries) {
      await sleep(TOKEN_RETRY_DELAY_MS);
    }
  }

  return undefined;
}

export async function getCachedAuthentikAccessToken(options?: {
  force?: boolean;
  retries?: number;
}) {
  const now = Date.now();
  const retries = options?.retries ?? 1;

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

  pendingAccessToken = requestAuthentikAccessToken(retries)
    .then((accessToken) => {
      cachedAccessToken = accessToken;
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
