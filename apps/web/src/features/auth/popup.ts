'use client';

export const AUTH_POPUP_MESSAGE = 'egolia-auth-popup-complete';

export type AuthPopupStatus = 'success' | 'signed-out' | 'error';

export type AuthPopupMessage = {
  type: typeof AUTH_POPUP_MESSAGE;
  status: AuthPopupStatus;
  redirectTo?: string;
};

export function postAuthPopupMessage(
  status: AuthPopupStatus,
  redirectTo?: string
) {
  const message: AuthPopupMessage = {
    redirectTo,
    status,
    type: AUTH_POPUP_MESSAGE,
  };

  if (window.opener) {
    window.opener.postMessage(message, window.location.origin);
  }
}

export function openCenteredPopup(url: string, name: string) {
  const width = 520;
  const height = 720;
  const left = Math.max((window.screen.width - width) / 2, 0);
  const top = Math.max((window.screen.height - height) / 2, 0);

  return window.open(
    url,
    name,
    [
      'popup=yes',
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'noopener=no',
      'noreferrer=no',
    ].join(',')
  );
}

export function waitForAuthPopup(
  popup: Window | null,
  timeoutMs = 120_000
) {
  return new Promise<AuthPopupMessage>((resolve, reject) => {
    if (!popup) {
      reject(new Error('Popup was blocked'));
      return;
    }

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Auth popup timed out'));
    }, timeoutMs);

    const poll = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('Auth popup closed before finishing'));
      }
    }, 600);

    const cleanup = () => {
      window.clearTimeout(timeout);
      window.clearInterval(poll);
      window.removeEventListener('message', onMessage);
    };

    const onMessage = (event: MessageEvent<AuthPopupMessage>) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type !== AUTH_POPUP_MESSAGE) {
        return;
      }

      cleanup();
      resolve(event.data);
    };

    window.addEventListener('message', onMessage);
  });
}
