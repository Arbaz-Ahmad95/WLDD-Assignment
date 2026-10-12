'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          maxWidth: '400px',
          width: '100%',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let border = 'var(--border-subtle)';
          let icon = <Info size={18} color="var(--brand-primary)" />;

          if (toast.type === 'success') {
            border = 'var(--accent-emerald-border)';
            icon = <CheckCircle2 size={18} color="var(--accent-emerald)" />;
          } else if (toast.type === 'error') {
            border = 'var(--accent-rose-border)';
            icon = <AlertCircle size={18} color="var(--accent-rose)" />;
          } else if (toast.type === 'warning') {
            border = 'var(--accent-amber-border)';
            icon = <AlertTriangle size={18} color="var(--accent-amber)" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: '#ffffff',
                border: `1px solid ${border}`,
                borderRadius: 'var(--radius-lg)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-lg)',
                color: 'var(--text-primary)',
                animation: 'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ marginTop: '2px' }}>{icon}</div>
              <div style={{ flex: 1 }}>
                {toast.title && (
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem', color: 'var(--text-primary)' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
