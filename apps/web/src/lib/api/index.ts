'use client';

import { client } from '../../../../../packages/api-gen/src/client.gen';
import { getCachedAuthentikAccessToken } from '../auth/access-token';

const optionallyAuthenticatedUrls = new Set([
  '/course/courses/{courseId}/landing',
]);

client.setConfig({
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.egolia.localhost',
});

client.interceptors.request.use(async (config) => {
  if (
    !config.security?.length &&
    !optionallyAuthenticatedUrls.has(config.url)
  ) {
    return;
  }

  try {
    const accessToken = await getCachedAuthentikAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
  } catch {
    // Public routes are allowed to call the API without an OAuth token.
  }
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeIntroductionVideoUrl(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((item) => normalizeIntroductionVideoUrl(item));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (value.introductionVideoUrl === '') {
    delete value.introductionVideoUrl;
  }

  Object.values(value).forEach((item) => normalizeIntroductionVideoUrl(item));
}

client.interceptors.response.use(async (response) => {
  const contentType = response.headers.get('content-type') ?? '';
  if (
    !contentType.includes('application/json') ||
    !response.url.includes('/course/')
  ) {
    return response;
  }

  const text = await response.text();
  if (!text) {
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  }

  normalizeIntroductionVideoUrl(data);

  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(JSON.stringify(data), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

client.interceptors.error.use((error, response) => {
  if (!response) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    return { status: response.status, ...error };
  }

  return {
    status: response.status,
    message: typeof error === 'string' ? error : undefined,
  };
});

export const apiClient = client;
