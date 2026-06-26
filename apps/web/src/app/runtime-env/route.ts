import { getPublicRuntimeEnvFromProcess } from '#/lib/env.server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  const runtimeEnv = JSON.stringify(getPublicRuntimeEnvFromProcess()).replace(
    /</g,
    '\\u003c'
  );

  const externalCheckoutRestoreGuard = `
(function () {
  var checkoutKey = 'egolia:external-checkout';

  function isVnpayReturn() {
    return (
      window.location.pathname === '/billing' &&
      new URLSearchParams(window.location.search).has('vnp_ResponseCode')
    );
  }

  function shouldRecoverFromExternalCheckout() {
    try {
      if (window.sessionStorage.getItem(checkoutKey) !== 'vnpay') {
        return false;
      }

      window.sessionStorage.removeItem(checkoutKey);
      return !isVnpayReturn();
    } catch {
      return false;
    }
  }

  function recoverFromExternalCheckout() {
    if (shouldRecoverFromExternalCheckout()) {
      window.location.reload();
    }
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      recoverFromExternalCheckout();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      recoverFromExternalCheckout();
    }
  });

  recoverFromExternalCheckout();
})();
`;

  return new Response(
    `window.__EGOLIA_RUNTIME_ENV__=${runtimeEnv};${externalCheckoutRestoreGuard}`,
    {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Content-Type': 'application/javascript; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
