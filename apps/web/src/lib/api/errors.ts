export type ApiProblem = {
  title: string;
  message: string;
  code?: string;
  status?: number;
};

const statusMessages: Record<number, ApiProblem> = {
  401: {
    title: 'Authentication Required',
    message: 'You need to sign in before continuing.',
    status: 401,
  },
  403: {
    title: 'Access Denied',
    message: 'Your account does not have permission to perform this action.',
    status: 403,
  },
  404: {
    title: 'Not Found',
    message: 'This data no longer exists or is not accessible.',
    status: 404,
  },
  502: {
    title: 'Course service chua chay',
    message:
      'Traefik khong ket noi duoc course service. Chay pnpm nx run course:run roi kiem tra http://api.egolia.localhost/course/health/live.',
    status: 502,
  },
  501: {
    title: 'Chưa triển khai',
    message: 'This endpoint is in the spec but not supported by backend yet.',
    status: 501,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeApiError(error: unknown): ApiProblem {
  if (isRecord(error)) {
    const code = typeof error.code === 'string' ? error.code : undefined;
    const status =
      typeof error.status === 'number'
        ? error.status
        : typeof error.statusCode === 'number'
          ? error.statusCode
          : undefined;
    const message =
      typeof error.message === 'string'
        ? error.message
        : typeof error.msg === 'string'
          ? error.msg
          : undefined;

    if (status && statusMessages[status]) {
      return {
        ...statusMessages[status],
        code,
        message: message ?? statusMessages[status].message,
      };
    }
    if (code === 'unauthorized') {
      return { ...statusMessages[401], code };
    }
    if (code === 'forbidden') {
      return { ...statusMessages[403], code };
    }
    if (code === 'unimplemented') {
      return { ...statusMessages[501], code };
    }
    if (code?.includes('NotFound')) {
      return {
        ...statusMessages[404],
        code,
        message: message ?? statusMessages[404].message,
      };
    }
    if (message || code) {
      return {
        title: 'Request failed',
        message: message ?? 'Backend returned an error without details.',
        code,
      };
    }
  }

  if (error instanceof TypeError) {
    return {
      title: 'API Connection Failed',
      message:
        'Check course service, Traefik, or NEXT_PUBLIC_API_BASE_URL and try again.',
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Request failed',
      message: error.message,
    };
  }

  if (typeof error === 'string' && error.trim()) {
    return {
      title: 'Request failed',
      message: error,
    };
  }

  return {
    title: 'An error occurred',
    message: 'Could not complete the request. Please try again.',
  };
}
