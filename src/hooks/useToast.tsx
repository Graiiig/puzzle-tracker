import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastOptions {
  icon?: string;
  title: string;
  body?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ActiveToast extends ToastOptions {
  id: number;
}

interface ToastValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const VARIANT_COLORS: Record<ToastVariant, { bg: string; fg: string }> = {
  default: { bg: 'var(--surface)', fg: 'var(--text-primary)' },
  success: { bg: 'var(--badge-green-bg)', fg: 'var(--badge-green-fg)' },
  error: { bg: 'var(--badge-red-bg)', fg: 'var(--badge-red-fg)' },
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = useCallback(() => {
    setVisible(false);
    removeTimerRef.current = setTimeout(() => setToast(null), 250);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(removeTimerRef.current);
    setToast({ ...options, id: nextId++ });
    requestAnimationFrame(() => setVisible(true));
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      removeTimerRef.current = setTimeout(() => setToast(null), 250);
    }, options.durationMs ?? 3500);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(hideTimerRef.current);
      clearTimeout(removeTimerRef.current);
    },
    [],
  );

  const colors = VARIANT_COLORS[toast?.variant ?? 'default'];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          onClick={dismiss}
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            zIndex: 60,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            background: colors.bg,
            color: colors.fg,
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 12px 32px oklch(20% 0.02 340 / 0.28)',
            cursor: 'pointer',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          {toast.icon && <span style={{ fontSize: 22, flexShrink: 0 }}>{toast.icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14 }}>{toast.title}</div>
            {toast.body && <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.9 }}>{toast.body}</div>}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
