import { getPublicRuntimeEnvFromProcess } from '#/lib/env.server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  const runtimeEnv = JSON.stringify(getPublicRuntimeEnvFromProcess()).replace(
    /</g,
    '\\u003c'
  );

  return new Response(`window.__EGOLIA_RUNTIME_ENV__=${runtimeEnv};`, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Content-Type': 'application/javascript; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
