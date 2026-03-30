import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 2147483647,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#fff',
            borderRadius: '10px',
            padding: '14px 18px',
            minWidth: '280px',
            maxWidth: '380px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            pointerEvents: 'all',
            fontFamily: "'DM Sans', sans-serif",
            border: `1.5px solid ${toast.type === 'success' ? '#86efac' : toast.type === 'error' ? '#fca5a5' : '#93c5fd'}`,
            borderLeft: `4px solid ${toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827', flex: 1 }}>
              {toast.message}
            </span>
            <button onClick={() => removeToast(toast.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', fontSize: '18px', padding: 0, lineHeight: 1, flexShrink: 0
            }}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}