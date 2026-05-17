'use client';

import { X } from 'lucide-react';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import { cn } from '#/components/lib/shadcn/utils';

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, options?: { title?: string; type?: ToastType }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options: { title?: string; type?: ToastType } = {}) => {
      const id = crypto.randomUUID();
      const { title, type = 'info' } = options;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => {
    toast(message, { title, type: 'success' });
  }, [toast]);

  const error = useCallback((message: string, title?: string) => {
    toast(message, { title, type: 'error' });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div
        className={cn(
          'fixed top-4 right-4 z-[9999] flex w-full max-w-[350px] flex-col gap-3'
        )}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex animate-fade-in flex-col overflow-hidden rounded-xl border border-[#D1D9E6]/50 bg-nm-bg shadow-nm-flat'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between border-b border-[#D1D9E6]/30 px-4 py-2'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn('size-2 rounded-full', {
                    'bg-blue-500': t.type === 'info',
                    'bg-green-500': t.type === 'success',
                    'bg-red-500': t.type === 'error',
                    'bg-amber-500': t.type === 'warning',
                  })}
                />
                <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                  {t.title || t.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="px-4 py-3 text-sm text-slate-700">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
