import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number;
}

export interface ToastItem {
  id: number;
  type: string;
  title: string;
  message: string;
  duration: number;
}

export interface ToastContextType {
  show: (message: string, opts?: ToastOptions) => number;
  success: (message: string, opts?: ToastOptions) => number;
  error: (message: string, opts?: ToastOptions) => number;
  info: (message: string, opts?: ToastOptions) => number;
  warning: (message: string, opts?: ToastOptions) => number;
  remove: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  show: () => 0,
  success: () => 0,
  error: () => 0,
  info: () => 0,
  warning: () => 0,
  remove: () => {}
});

let idSeq = 1;

export interface ToastProviderProps {
  children?: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showBase = useCallback((type: string, message: string, opts: ToastOptions = {}) => {
    const id = idSeq++;
    const duration = Math.max(1500, Math.min(opts.duration || 3000, 10000));
    const title = opts.title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice');
    const toast: ToastItem = { id, type, title, message: String(message || ''), duration };
    setToasts((list) => [...list, toast]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const api: ToastContextType = useMemo(() => ({
    show: (message: string, opts?: ToastOptions) => showBase(opts?.type || 'info', message, opts),
    success: (message: string, opts?: ToastOptions) => showBase('success', message, opts),
    error: (message: string, opts?: ToastOptions) => showBase('error', message, opts),
    info: (message: string, opts?: ToastOptions) => showBase('info', message, opts),
    warning: (message: string, opts?: ToastOptions) => showBase('warning', message, opts),
    remove,
  }), [showBase, remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-96">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-xl border shadow bg-white overflow-hidden animate-fade-in`}
               role="status" aria-live="polite">
            <div className={`px-4 py-3 flex items-start gap-3 ${
              t.type === 'success' ? 'border-green-200' : t.type === 'error' ? 'border-red-200' : t.type === 'warning' ? 'border-yellow-200' : 'border-blue-200'
            }`}>
              <div className={`text-xl leading-none mt-0.5 ${
                t.type === 'success' ? 'text-green-600' : t.type === 'error' ? 'text-red-600' : t.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{t.title}</div>
                {t.message && <div className="text-sm text-gray-700 break-words">{t.message}</div>}
              </div>
              <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                ×
              </button>
            </div>
            {t.duration > 0 && (
              <div className="h-1 w-full bg-gray-100">
                <div className={`h-full ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : t.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                     style={{ animation: `toast-progress ${t.duration}ms linear forwards` }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-progress { from { width: 100%; } to { width: 0%; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 160ms ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
