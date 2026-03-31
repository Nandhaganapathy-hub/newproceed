import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          let icon = 'info';
          let textColor = 'text-primary';
          if (t.type === 'error') { icon = 'error'; textColor = 'text-error'; }
          if (t.type === 'warning') { icon = 'warning'; textColor = 'text-tertiary'; }
          if (t.type === 'success') { icon = 'check_circle'; textColor = 'text-primary'; }

          return (
            <div key={t.id} className="pointer-events-auto bg-surface-container-highest text-on-surface border border-outline-variant/30 shadow-lg p-3 rounded-xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
              <span className={`material-symbols-outlined ${textColor}`}>{icon}</span>
              <p className="text-sm font-medium">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
