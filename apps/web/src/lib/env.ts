export type PublicRuntimeEnv = {
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_BETTER_AUTH_URL: string;
  NEXT_PUBLIC_AUTHENTIK_END_SESSION_URL: string;
  NEXT_PUBLIC_AUTHENTIK_ENROLLMENT_URL: string;
  NEXT_PUBLIC_AUTHENTIK_LOGOUT_URL: string;
  NEXT_PUBLIC_AUTHENTIK_POST_LOGOUT_REDIRECT_URI: string;
};

export const defaultPublicRuntimeEnv: PublicRuntimeEnv = {
  NEXT_PUBLIC_API_BASE_URL: 'http://api.egolia.localhost',
  NEXT_PUBLIC_BETTER_AUTH_URL: 'http://web.egolia.localhost',
  NEXT_PUBLIC_AUTHENTIK_END_SESSION_URL:
    'http://authentik.egolia.localhost/application/o/app-web/end-session/',
  NEXT_PUBLIC_AUTHENTIK_ENROLLMENT_URL:
    'http://authentik.egolia.localhost/if/flow/egolia-enrollment/',
  NEXT_PUBLIC_AUTHENTIK_LOGOUT_URL:
    'http://authentik.egolia.localhost/if/flow/default-invalidation-flow/',
  NEXT_PUBLIC_AUTHENTIK_POST_LOGOUT_REDIRECT_URI: '',
};

export const publicRuntimeEnvKeys = Object.keys(
  defaultPublicRuntimeEnv
) as Array<keyof PublicRuntimeEnv>;

export function getPublicRuntimeEnv(): PublicRuntimeEnv {
  if (typeof window === 'undefined') {
    return defaultPublicRuntimeEnv;
  }

  return {
    ...defaultPublicRuntimeEnv,
    ...window.__EGOLIA_RUNTIME_ENV__,
  };
}

declare global {
  interface Window {
    __EGOLIA_RUNTIME_ENV__?: Partial<PublicRuntimeEnv>;
  }
}
