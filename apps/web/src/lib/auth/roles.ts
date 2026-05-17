'use client';

import { authClient } from '#/lib/auth';
import { getCachedAuthentikAccessToken } from '#/lib/auth/access-token';

export type ActorRole = 'learner' | 'instructor' | 'admin';

export type Viewer = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles: ActorRole[];
  accessToken?: string;
};

type TokenPayload = {
  sub?: string;
  email?: string;
  name?: string;
  roles?: unknown;
  entitlements?: unknown;
};

const actorRoles = ['learner', 'instructor', 'admin'] as const;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  );
  return atob(padded);
}

function parseTokenPayload(token?: string): TokenPayload {
  if (!token) {
    return {};
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return {};
    }
    return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  } catch {
    return {};
  }
}

function normalizeRoles(value: unknown): ActorRole[] {
  const rawRoles = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,\s]+/)
      : [];

  if (!rawRoles.length) {
    return [];
  }

  return rawRoles
    .filter((role): role is ActorRole =>
      actorRoles.includes(String(role).toLowerCase() as ActorRole)
    )
    .map((role) => String(role).toLowerCase() as ActorRole);
}

export function hasRole(viewer: Viewer | null | undefined, role: ActorRole) {
  return Boolean(viewer?.roles.includes(role));
}

export function primaryRole(viewer: Viewer | null | undefined): ActorRole {
  if (!viewer) {
    return 'learner';
  }
  if (hasRole(viewer, 'admin')) {
    return 'admin';
  }
  if (hasRole(viewer, 'instructor')) {
    return 'instructor';
  }
  return 'learner';
}

export function routeForViewer(viewer: Viewer | null | undefined) {
  switch (primaryRole(viewer)) {
    case 'admin':
      return '/admin/courses';
    case 'instructor':
      return '/instructor/courses';
    case 'learner':
    default:
      return '/courses';
  }
}

export async function getViewer(): Promise<Viewer> {
  const sessionResult = await authClient.getSession().catch(() => undefined);
  const session = sessionResult?.data;

  if (!session?.user) {
    return {
      roles: [],
    };
  }

  const accessToken = await getCachedAuthentikAccessToken();
  const payload = parseTokenPayload(accessToken);
  const roles = [
    ...new Set([
      ...normalizeRoles(payload.roles),
      ...normalizeRoles(payload.entitlements),
    ]),
  ];

  return {
    id: session?.user?.id ?? payload.sub,
    name: session?.user?.name ?? payload.name,
    email: session?.user?.email ?? payload.email,
    image: session?.user?.image,
    roles,
    accessToken,
  };
}
