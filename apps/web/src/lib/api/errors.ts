export type ApiProblem = {
  title: string;
  message: string;
  code?: string;
  status?: number;
};

const statusMessages: Record<number, ApiProblem> = {
  401: {
    title: 'Cần đăng nhập',
    message: 'Bạn cần sign in trước khi tiếp tục.',
    status: 401,
  },
  403: {
    title: 'Không đủ quyền',
    message: 'Tài khoản hiện tại không có quyền thực hiện thao tác này.',
    status: 403,
  },
  404: {
    title: 'Không tìm thấy',
    message: 'Dữ liệu này không còn tồn tại hoặc bạn không thể truy cập.',
    status: 404,
  },
  501: {
    title: 'Chưa triển khai',
    message: 'Endpoint này đang có trong spec nhưng backend chưa hỗ trợ.',
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
        message: message ?? 'Backend trả về lỗi nhưng không có mô tả chi tiết.',
        code,
      };
    }
  }

  if (error instanceof TypeError) {
    return {
      title: 'Không kết nối được API',
      message:
        'Kiểm tra course service, Traefik, hoặc NEXT_PUBLIC_API_BASE_URL rồi thử lại.',
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
    title: 'Có lỗi xảy ra',
    message: 'Không thể hoàn tất request. Vui lòng thử lại.',
  };
}
