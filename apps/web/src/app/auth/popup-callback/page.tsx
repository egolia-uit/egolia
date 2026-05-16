'use client';

import { useEffect } from 'react';

import { postAuthPopupMessage } from '#/features/auth/popup';

export default function AuthPopupCallbackPage() {
  useEffect(() => {
    postAuthPopupMessage('success', '/dashboard');
    const timeout = window.setTimeout(() => window.close(), 250);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className="
      grid min-h-dvh place-items-center bg-slate-950 px-6 text-white
    ">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">Dang hoan tat dang nhap</h1>
        <p className="mt-2 text-sm text-slate-300">
          Cua so nay se tu dong dong lai.
        </p>
      </div>
    </main>
  );
}
